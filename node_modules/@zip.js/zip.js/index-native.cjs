'use strict';

var _documentCurrentScript = typeof document !== 'undefined' ? document.currentScript : null;
/*
 Copyright (c) 2022 Gildas Lormeau. All rights reserved.

 Redistribution and use in source and binary forms, with or without
 modification, are permitted provided that the following conditions are met:

 1. Redistributions of source code must retain the above copyright notice,
 this list of conditions and the following disclaimer.

 2. Redistributions in binary form must reproduce the above copyright 
 notice, this list of conditions and the following disclaimer in 
 the documentation and/or other materials provided with the distribution.

 3. The names of the authors may not be used to endorse or promote products
 derived from this software without specific prior written permission.

 THIS SOFTWARE IS PROVIDED ''AS IS'' AND ANY EXPRESSED OR IMPLIED WARRANTIES,
 INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND
 FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL JCRAFT,
 INC. OR ANY CONTRIBUTORS TO THIS SOFTWARE BE LIABLE FOR ANY DIRECT, INDIRECT,
 INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA,
 OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
 LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
 EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

const MAX_32_BITS = 0xffffffff;
const MAX_16_BITS = 0xffff;
const MAX_8_BITS = 0xff;
const COMPRESSION_METHOD_DEFLATE = 0x08;
const COMPRESSION_METHOD_DEFLATE_64 = 0x09;
const COMPRESSION_METHOD_STORE = 0x00;
const COMPRESSION_METHOD_AES = 0x63;

const LOCAL_FILE_HEADER_SIGNATURE = 0x04034b50;
const SPLIT_ZIP_FILE_SIGNATURE = 0x08074b50;
const DATA_DESCRIPTOR_RECORD_SIGNATURE = SPLIT_ZIP_FILE_SIGNATURE;
const CENTRAL_FILE_HEADER_SIGNATURE = 0x02014b50;
const END_OF_CENTRAL_DIR_SIGNATURE = 0x06054b50;
const ZIP64_END_OF_CENTRAL_DIR_SIGNATURE = 0x06064b50;
const ZIP64_END_OF_CENTRAL_DIR_LOCATOR_SIGNATURE = 0x07064b50;
const CENTRAL_FILE_HEADER_LENGTH = 46;
const END_OF_CENTRAL_DIR_LENGTH = 22;
const ZIP64_END_OF_CENTRAL_DIR_LOCATOR_LENGTH = 20;
const ZIP64_END_OF_CENTRAL_DIR_LENGTH = 56;
const ZIP64_END_OF_CENTRAL_DIR_TOTAL_LENGTH = END_OF_CENTRAL_DIR_LENGTH + ZIP64_END_OF_CENTRAL_DIR_LOCATOR_LENGTH + ZIP64_END_OF_CENTRAL_DIR_LENGTH;

const DATA_DESCRIPTOR_RECORD_LENGTH = 12;
const DATA_DESCRIPTOR_RECORD_ZIP_64_LENGTH = 20;
const DATA_DESCRIPTOR_RECORD_SIGNATURE_LENGTH = 4;

const EXTRAFIELD_TYPE_ZIP64 = 0x0001;
const EXTRAFIELD_TYPE_AES = 0x9901;
const EXTRAFIELD_TYPE_NTFS = 0x000a;
const EXTRAFIELD_TYPE_NTFS_TAG1 = 0x0001;
const EXTRAFIELD_TYPE_EXTENDED_TIMESTAMP = 0x5455;
const EXTRAFIELD_TYPE_UNICODE_PATH = 0x7075;
const EXTRAFIELD_TYPE_UNICODE_COMMENT = 0x6375;
const EXTRAFIELD_TYPE_USDZ = 0x1986;
const EXTRAFIELD_TYPE_INFOZIP = 0x7875;
const EXTRAFIELD_TYPE_UNIX = 0x7855;

const BITFLAG_ENCRYPTED = 0b1;
const BITFLAG_LEVEL = 0b0110;
const BITFLAG_LEVEL_MAX_MASK = 0b010;
const BITFLAG_LEVEL_FAST_MASK = 0b100;
const BITFLAG_LEVEL_SUPER_FAST_MASK = 0b110;
const BITFLAG_DATA_DESCRIPTOR = 0b1000;
const BITFLAG_LANG_ENCODING_FLAG = 0b100000000000;
const FILE_ATTR_MSDOS_DIR_MASK = 0b10000;
const FILE_ATTR_MSDOS_READONLY_MASK = 0x01;
const FILE_ATTR_MSDOS_HIDDEN_MASK = 0x02;
const FILE_ATTR_MSDOS_SYSTEM_MASK = 0x04;
const FILE_ATTR_MSDOS_ARCHIVE_MASK = 0x20;
const FILE_ATTR_UNIX_TYPE_MASK = 0o170000;
const FILE_ATTR_UNIX_TYPE_DIR = 0o040000;
const FILE_ATTR_UNIX_EXECUTABLE_MASK = 0o111;
const FILE_ATTR_UNIX_DEFAULT_MASK = 0o644;
const FILE_ATTR_UNIX_SETUID_MASK = 0o4000;
const FILE_ATTR_UNIX_SETGID_MASK = 0o2000;
const FILE_ATTR_UNIX_STICKY_MASK = 0o1000;

const VERSION_DEFLATE = 0x14;
const VERSION_ZIP64 = 0x2D;
const VERSION_AES = 0x33;

const DIRECTORY_SIGNATURE = "/";

const HEADER_SIZE = 30;
const HEADER_OFFSET_VERSION = 0;
const HEADER_OFFSET_SIGNATURE = 10;
const HEADER_OFFSET_COMPRESSED_SIZE = 14;
const HEADER_OFFSET_UNCOMPRESSED_SIZE = 18;
const LOCAL_HEADER_COMMON_OFFSET = 4;

const MAX_DATE = new Date(2107, 11, 31);
const MIN_DATE = new Date(1980, 0, 1);

const UNDEFINED_VALUE = undefined;
const INFINITY_VALUE = Infinity;
const UNDEFINED_TYPE = "undefined";
const FUNCTION_TYPE = "function";
const OBJECT_TYPE = "object";

const EMPTY_UINT8_ARRAY = new Uint8Array();

/*
 Copyright (c) 2025 Gildas Lormeau. All rights reserved.

 Redistribution and use in source and binary forms, with or without
 modification, are permitted provided that the following conditions are met:

 1. Redistributions of source code must retain the above copyright notice,
 this list of conditions and the following disclaimer.

 2. Redistributions in binary form must reproduce the above copyright 
 notice, this list of conditions and the following disclaimer in 
 the documentation and/or other materials provided with the distribution.

 3. The names of the authors may not be used to endorse or promote products
 derived from this software without specific prior written permission.

 THIS SOFTWARE IS PROVIDED ''AS IS'' AND ANY EXPRESSED OR IMPLIED WARRANTIES,
 INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND
 FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL JCRAFT,
 INC. OR ANY CONTRIBUTORS TO THIS SOFTWARE BE LIABLE FOR ANY DIRECT, INDIRECT,
 INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA,
 OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
 LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
 EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */


const MINIMUM_CHUNK_SIZE = 64;
let maxWorkers = 2;
try {
	if (typeof navigator != UNDEFINED_TYPE && navigator.hardwareConcurrency) {
		maxWorkers = navigator.hardwareConcurrency;
	}
} catch {
	// ignored
}
const DEFAULT_CONFIGURATION = {
	workerURI: "./core/web-worker-wasm.js",
	wasmURI: "./core/streams/zlib-wasm/zlib-streams.wasm",
	chunkSize: 64 * 1024,
	maxWorkers,
	terminateWorkerTimeout: 5000,
	workerStarvationTimeout: 5000,
	useWebWorkers: true,
	useCompressionStream: true,
	CompressionStream: typeof CompressionStream != UNDEFINED_TYPE && CompressionStream,
	DecompressionStream: typeof DecompressionStream != UNDEFINED_TYPE && DecompressionStream
};

const CONFIGURABLE_PROPERTY_NAMES = [
	"baseURI",
	"wasmURI",
	"workerURI",
	"chunkSize",
	"maxWorkers",
	"terminateWorkerTimeout",
	"workerStarvationTimeout",
	"useCompressionStream",
	"useWebWorkers",
	"CompressionStream",
	"DecompressionStream",
	"CompressionStreamZlib",
	"DecompressionStreamZlib"
];

const config = Object.assign({}, DEFAULT_CONFIGURATION);

function getConfiguration() {
	return config;
}

function getChunkSize(config) {
	return Math.max(config.chunkSize, MINIMUM_CHUNK_SIZE);
}

function configure(configuration) {
	for (const propertyName of CONFIGURABLE_PROPERTY_NAMES) {
		const propertyValue = configuration[propertyName];
		if (propertyValue !== UNDEFINED_VALUE) {
			config[propertyName] = propertyValue;
		}
	}
}

const r=[3,4,5,6,7,8,9,10,11,13,15,17,19,23,27,31,35,43,51,59,67,83,99,115,131,163,195,227,258],t=[0,0,0,0,0,0,0,0,1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,0],o=[1,2,3,4,5,7,9,13,17,25,33,49,65,97,129,193,257,385,513,769,1025,1537,2049,3073,4097,6145,8193,12289,16385,24577],e=[0,0,0,0,1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10,11,11,12,12,13,13],a=[16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15],h=new Uint8Array(288);h.fill(8,0,144),h.fill(9,144,256),h.fill(7,256,280),h.fill(8,280,288);const l=new Uint8Array(30).fill(5);function n(r){const t=new Uint16Array(16);for(const o of r)t[o]++;t[0]=0;const o=new Uint16Array(17);for(let r=1;15>=r;r++)o[r+1]=o[r]+t[r];const e=new Uint16Array(r.length);for(let t=0;t<r.length;t++)r[t]&&(e[o[r[t]]++]=t);return {t:t,symbols:e}}const s="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";function f(f){f({workerURI:f=>{const q="text/javascript",P=(s=>{let f=0,q=0,P=0,V=new Uint8Array(1024),d=0,u=0;for(;!u;){u=H(1);const r=H(2);if(0==r)K();else if(1==r)X(n(h),n(l));else {if(2!=r)throw Error("invalid deflate block type");X(...i());}}return V.subarray(0,d);function G(){if(f>=s.length)throw Error("unexpected end of deflate data");return s[f++]}function H(r){for(;r>P;)q|=G()<<P,P+=8;const t=q&(1<<r)-1;return q>>>=r,P-=r,t}function K(){q=0,P=0;const r=G()|G()<<8;f+=2,y(d+r);for(let t=0;r>t;t++)V[d++]=G();}function X(a,h){let l=b(a);for(;256!=l;){if(256>l)y(d+1),V[d++]=l;else {const a=l-257,n=r[a]+H(t[a]),s=b(h),f=o[s]+H(e[s]);y(d+n);const q=d-f;for(let r=0;n>r;r++)V[d++]=V[q+r];}l=b(a);}}function i(){const r=H(5)+257,t=H(5)+1,o=H(4)+4,e=new Uint8Array(19);for(let r=0;o>r;r++)e[a[r]]=H(3);const h=n(e),l=new Uint8Array(r+t);let s=0;for(;s<l.length;){const r=b(h);if(16>r)l[s++]=r;else if(16==r){const r=l[s-1];let t=H(2)+3;for(;t--;)l[s++]=r;}else s+=17==r?H(3)+3:H(7)+11;}return [n(l.subarray(0,r)),n(l.subarray(r))]}function b(r){const{t:t,symbols:o}=r;let e=0,a=0,h=0;for(let r=1;15>=r;r++){e|=H(1);const l=t[r];if(l>e-a)return o[h+(e-a)];h+=l,a=a+l<<1,e<<=1;}throw Error("invalid huffman code")}function y(r){if(V.length<r){let t=2*V.length;for(;r>t;)t*=2;const o=new Uint8Array(t);o.set(V.subarray(0,d)),V=o;}}})((r=>{const t=(r=(r+"").replace(/[^A-Za-z0-9+/=]/g,"")).length,o=[];for(let e=0;t>e;e+=4){const t=s.indexOf(r[e])<<18|s.indexOf(r[e+1])<<12|(63&s.indexOf(r[e+2]))<<6|63&s.indexOf(r[e+3]);o.push(t>>16&255),"="!==r[e+2]&&o.push(t>>8&255),"="!==r[e+3]&&o.push(255&t);}return new Uint8Array(o)})("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"));if(f){const r=new Blob([P],{type:q});return URL.createObjectURL(r)}return "data:"+q+";base64,"+(r=>{let t="";const o=r.length;let e=0;for(;o>e+2;e+=3){const o=r[e]<<16|r[e+1]<<8|r[e+2];t+=s[o>>18&63]+s[o>>12&63]+s[o>>6&63]+s[63&o];}const a=o-e;if(1===a){const o=r[e]<<16;t+=s[o>>18&63]+s[o>>12&63]+"==";}else if(2===a){const o=r[e]<<16|r[e+1]<<8;t+=s[o>>18&63]+s[o>>12&63]+s[o>>6&63]+"=";}return t})(P)}});}

/*
 Copyright (c) 2022 Gildas Lormeau. All rights reserved.

 Redistribution and use in source and binary forms, with or without
 modification, are permitted provided that the following conditions are met:

 1. Redistributions of source code must retain the above copyright notice,
 this list of conditions and the following disclaimer.

 2. Redistributions in binary form must reproduce the above copyright 
 notice, this list of conditions and the following disclaimer in 
 the documentation and/or other materials provided with the distribution.

 3. The names of the authors may not be used to endorse or promote products
 derived from this software without specific prior written permission.

 THIS SOFTWARE IS PROVIDED ''AS IS'' AND ANY EXPRESSED OR IMPLIED WARRANTIES,
 INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND
 FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL JCRAFT,
 INC. OR ANY CONTRIBUTORS TO THIS SOFTWARE BE LIABLE FOR ANY DIRECT, INDIRECT,
 INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA,
 OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
 LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
 EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

// Slicing-by-8 CRC-32 (Intel / zlib). The eight 256-entry tables let the inner loop
// consume 8 bytes per iteration with a shorter dependency chain, ~4x the byte-at-a-time
// rate (measured ~320 -> ~1400 MB/s on 64KB chunks).
//
// Every table MUST stay a PACKED_SMI array: build with array literals (not `new Array(n)`,
// which is HOLEY) and store the signed int32 XOR result (no `>>> 0`). An unsigned or holey
// table becomes a V8 FixedDoubleArray whose every hot-loop lookup unboxes a double (~1.6x
// slower). Signedness is irrelevant to the result — the reads mask/shift it and the final
// `~crc` normalizes it. Do NOT reintroduce `>>> 0` here or switch to `new Array(256)`.
const T = [[], [], [], [], [], [], [], []];
for (let n = 0; n < 256; n++) {
	let t = n;
	for (let j = 0; j < 8; j++) {
		t = (t & 1) ? (t >>> 1) ^ 0xEDB88320 : t >>> 1;
	}
	T[0][n] = t;
}
for (let n = 0; n < 256; n++) {
	for (let k = 1; k < 8; k++) {
		const previous = T[k - 1][n];
		T[k][n] = (previous >>> 8) ^ T[0][previous & 0xFF];
	}
}
const [T0, T1, T2, T3, T4, T5, T6, T7] = T;

class Crc32 {

	constructor(crc) {
		this.crc = crc || -1;
	}

	append(data) {
		let crc = this.crc | 0;
		const length = data.length | 0;
		let offset = 0;
		// Process 8 bytes per iteration over the typed-array body. DataView.getInt32(le)
		// reads an unaligned little-endian word as a signed int32 (no double boxing), so no
		// alignment or endianness handling is needed; data.buffer guards non-typed inputs.
		if (length >= 8 && data.buffer) {
			const view = new DataView(data.buffer, data.byteOffset, length);
			const end = length - 8;
			for (; offset <= end; offset += 8) {
				const a = crc ^ view.getInt32(offset, true);
				const b = view.getInt32(offset + 4, true);
				crc = T7[a & 0xFF] ^ T6[(a >>> 8) & 0xFF] ^ T5[(a >>> 16) & 0xFF] ^ T4[(a >>> 24) & 0xFF] ^
					T3[b & 0xFF] ^ T2[(b >>> 8) & 0xFF] ^ T1[(b >>> 16) & 0xFF] ^ T0[(b >>> 24) & 0xFF];
			}
		}
		// Remaining tail (and non-typed inputs) byte-at-a-time with the base table.
		for (; offset < length; offset++) {
			crc = (crc >>> 8) ^ T0[(crc ^ data[offset]) & 0xFF];
		}
		this.crc = crc;
	}

	get() {
		return ~this.crc;
	}
}

/*
 Copyright (c) 2022 Gildas Lormeau. All rights reserved.

 Redistribution and use in source and binary forms, with or without
 modification, are permitted provided that the following conditions are met:

 1. Redistributions of source code must retain the above copyright notice,
 this list of conditions and the following disclaimer.

 2. Redistributions in binary form must reproduce the above copyright 
 notice, this list of conditions and the following disclaimer in 
 the documentation and/or other materials provided with the distribution.

 3. The names of the authors may not be used to endorse or promote products
 derived from this software without specific prior written permission.

 THIS SOFTWARE IS PROVIDED ''AS IS'' AND ANY EXPRESSED OR IMPLIED WARRANTIES,
 INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND
 FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL JCRAFT,
 INC. OR ANY CONTRIBUTORS TO THIS SOFTWARE BE LIABLE FOR ANY DIRECT, INDIRECT,
 INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA,
 OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
 LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
 EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */


class Crc32Stream extends TransformStream {

	constructor() {
		// deno-lint-ignore prefer-const
		let stream;
		const crc32 = new Crc32();
		super({
			transform(chunk, controller) {
				crc32.append(chunk);
				controller.enqueue(chunk);
			},
			flush() {
				const value = new Uint8Array(4);
				const dataView = new DataView(value.buffer);
				dataView.setUint32(0, crc32.get());
				stream.value = value;
			}
		});
		stream = this;
	}
}

/*
 Copyright (c) 2022 Gildas Lormeau. All rights reserved.

 Redistribution and use in source and binary forms, with or without
 modification, are permitted provided that the following conditions are met:

 1. Redistributions of source code must retain the above copyright notice,
 this list of conditions and the following disclaimer.

 2. Redistributions in binary form must reproduce the above copyright 
 notice, this list of conditions and the following disclaimer in 
 the documentation and/or other materials provided with the distribution.

 3. The names of the authors may not be used to endorse or promote products
 derived from this software without specific prior written permission.

 THIS SOFTWARE IS PROVIDED ''AS IS'' AND ANY EXPRESSED OR IMPLIED WARRANTIES,
 INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND
 FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL JCRAFT,
 INC. OR ANY CONTRIBUTORS TO THIS SOFTWARE BE LIABLE FOR ANY DIRECT, INDIRECT,
 INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA,
 OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
 LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
 EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */


function encodeText(value) {
	// deno-lint-ignore valid-typeof
	if (typeof TextEncoder == UNDEFINED_TYPE) {
		value = unescape(encodeURIComponent(value));
		const result = new Uint8Array(value.length);
		for (let i = 0; i < result.length; i++) {
			result[i] = value.charCodeAt(i);
		}
		return result;
	} else {
		return new TextEncoder().encode(value);
	}
}

// Derived from https://github.com/xqdoo00o/jszip/blob/master/lib/sjcl.js and https://github.com/bitwiseshiftleft/sjcl

// deno-lint-ignore-file no-this-alias

/*
 * SJCL is open. You can use, modify and redistribute it under a BSD
 * license or under the GNU GPL, version 2.0.
 */

/** @fileOverview Javascript cryptography implementation.
 *
 * Crush to remove comments, shorten variable names and
 * generally reduce transmission size.
 *
 * @author Emily Stark
 * @author Mike Hamburg
 * @author Dan Boneh
 */

/*jslint indent: 2, bitwise: false, nomen: false, plusplus: false, white: false, regexp: false */

/** @fileOverview Arrays of bits, encoded as arrays of Numbers.
 *
 * @author Emily Stark
 * @author Mike Hamburg
 * @author Dan Boneh
 */

/**
 * Arrays of bits, encoded as arrays of Numbers.
 * @namespace
 * @description
 * <p>
 * These objects are the currency accepted by SJCL's crypto functions.
 * </p>
 *
 * <p>
 * Most of our crypto primitives operate on arrays of 4-byte words internally,
 * but many of them can take arguments that are not a multiple of 4 bytes.
 * This library encodes arrays of bits (whose size need not be a multiple of 8
 * bits) as arrays of 32-bit words.  The bits are packed, big-endian, into an
 * array of words, 32 bits at a time.  Since the words are double-precision
 * floating point numbers, they fit some extra data.  We use this (in a private,
 * possibly-changing manner) to encode the number of bits actually  present
 * in the last word of the array.
 * </p>
 *
 * <p>
 * Because bitwise ops clear this out-of-band data, these arrays can be passed
 * to ciphers like AES which want arrays of words.
 * </p>
 */
const bitArray = {
	/**
	 * Concatenate two bit arrays.
	 * @param {bitArray} a1 The first array.
	 * @param {bitArray} a2 The second array.
	 * @return {bitArray} The concatenation of a1 and a2.
	 */
	concat(a1, a2) {
		if (a1.length === 0 || a2.length === 0) {
			return a1.concat(a2);
		}

		const last = a1[a1.length - 1], shift = bitArray.getPartial(last);
		if (shift === 32) {
			return a1.concat(a2);
		} else {
			return bitArray._shiftRight(a2, shift, last | 0, a1.slice(0, a1.length - 1));
		}
	},

	/**
	 * Find the length of an array of bits.
	 * @param {bitArray} a The array.
	 * @return {Number} The length of a, in bits.
	 */
	bitLength(a) {
		const l = a.length;
		if (l === 0) {
			return 0;
		}
		const x = a[l - 1];
		return (l - 1) * 32 + bitArray.getPartial(x);
	},

	/**
	 * Truncate an array.
	 * @param {bitArray} a The array.
	 * @param {Number} len The length to truncate to, in bits.
	 * @return {bitArray} A new array, truncated to len bits.
	 */
	clamp(a, len) {
		if (a.length * 32 < len) {
			return a;
		}
		a = a.slice(0, Math.ceil(len / 32));
		const l = a.length;
		len = len & 31;
		if (l > 0 && len) {
			a[l - 1] = bitArray.partial(len, a[l - 1] & 0x80000000 >> (len - 1), 1);
		}
		return a;
	},

	/**
	 * Make a partial word for a bit array.
	 * @param {Number} len The number of bits in the word.
	 * @param {Number} x The bits.
	 * @param {Number} [_end=0] Pass 1 if x has already been shifted to the high side.
	 * @return {Number} The partial word.
	 */
	partial(len, x, _end) {
		if (len === 32) {
			return x;
		}
		return (_end ? x | 0 : x << (32 - len)) + len * 0x10000000000;
	},

	/**
	 * Get the number of bits used by a partial word.
	 * @param {Number} x The partial word.
	 * @return {Number} The number of bits used by the partial word.
	 */
	getPartial(x) {
		return Math.round(x / 0x10000000000) || 32;
	},

	/** Shift an array right.
	 * @param {bitArray} a The array to shift.
	 * @param {Number} shift The number of bits to shift.
	 * @param {Number} [carry=0] A byte to carry in
	 * @param {bitArray} [out=[]] An array to prepend to the output.
	 * @private
	 */
	_shiftRight(a, shift, carry, out) {
		if (out === undefined) {
			out = [];
		}

		for (; shift >= 32; shift -= 32) {
			out.push(carry);
			carry = 0;
		}
		if (shift === 0) {
			return out.concat(a);
		}

		for (let i = 0; i < a.length; i++) {
			out.push(carry | a[i] >>> shift);
			carry = a[i] << (32 - shift);
		}
		const last2 = a.length ? a[a.length - 1] : 0;
		const shift2 = bitArray.getPartial(last2);
		out.push(bitArray.partial(shift + shift2 & 31, (shift + shift2 > 32) ? carry : out.pop(), 1));
		return out;
	}
};

/** @fileOverview Bit array codec implementations.
 *
 * @author Emily Stark
 * @author Mike Hamburg
 * @author Dan Boneh
 */

/**
 * Arrays of bytes
 * @namespace
 */
const codec = {
	bytes: {
		/** Convert from a bitArray to an array of bytes. */
		fromBits(arr) {
			const bl = bitArray.bitLength(arr);
			const byteLength = bl / 8;
			const out = new Uint8Array(byteLength);
			let tmp;
			for (let i = 0; i < byteLength; i++) {
				if ((i & 3) === 0) {
					tmp = arr[i / 4];
				}
				out[i] = tmp >>> 24;
				tmp <<= 8;
			}
			return out;
		},
		/** Convert from an array of bytes to a bitArray. */
		toBits(bytes) {
			const out = [];
			let i;
			let tmp = 0;
			for (i = 0; i < bytes.length; i++) {
				tmp = tmp << 8 | bytes[i];
				if ((i & 3) === 3) {
					out.push(tmp);
					tmp = 0;
				}
			}
			if (i & 3) {
				out.push(bitArray.partial(8 * (i & 3), tmp));
			}
			return out;
		}
	}
};

const hash = {};

/**
 * Context for a SHA-1 operation in progress.
 * @constructor
 */
hash.sha1 = class {
	constructor(hash) {
		const sha1 = this;
		/**
		 * The hash's block size, in bits.
		 * @constant
		 */
		sha1.blockSize = 512;
		/**
		 * The SHA-1 initialization vector.
		 * @private
		 */
		sha1._init = [0x67452301, 0xEFCDAB89, 0x98BADCFE, 0x10325476, 0xC3D2E1F0];
		/**
		 * The SHA-1 hash key.
		 * @private
		 */
		sha1._key = [0x5A827999, 0x6ED9EBA1, 0x8F1BBCDC, 0xCA62C1D6];
		if (hash) {
			sha1._h = hash._h.slice(0);
			sha1._buffer = hash._buffer.slice(0);
			sha1._length = hash._length;
		} else {
			sha1.reset();
		}
	}

	/**
	 * Reset the hash state.
	 * @return this
	 */
	reset() {
		const sha1 = this;
		sha1._h = sha1._init.slice(0);
		sha1._buffer = [];
		sha1._length = 0;
		return sha1;
	}

	/**
	 * Input several words to the hash.
	 * @param {bitArray|String} data the data to hash.
	 * @return this
	 */
	update(data) {
		const sha1 = this;
		if (typeof data === "string") {
			data = codec.utf8String.toBits(data);
		}
		const b = sha1._buffer = bitArray.concat(sha1._buffer, data);
		const ol = sha1._length;
		const nl = sha1._length = ol + bitArray.bitLength(data);
		if (nl > 9007199254740991) {
			throw new Error("Cannot hash more than 2^53 - 1 bits");
		}
		const c = new Uint32Array(b);
		let j = 0;
		for (let i = sha1.blockSize + ol - ((sha1.blockSize + ol) & (sha1.blockSize - 1)); i <= nl;
			i += sha1.blockSize) {
			sha1._block(c.subarray(16 * j, 16 * (j + 1)));
			j += 1;
		}
		b.splice(0, 16 * j);
		return sha1;
	}

	/**
	 * Complete hashing and output the hash value.
	 * @return {bitArray} The hash value, an array of 5 big-endian words. TODO
	 */
	finalize() {
		const sha1 = this;
		let b = sha1._buffer;
		const h = sha1._h;

		// Round out and push the buffer
		b = bitArray.concat(b, [bitArray.partial(1, 1)]);
		// Round out the buffer to a multiple of 16 words, less the 2 length words.
		for (let i = b.length + 2; i & 15; i++) {
			b.push(0);
		}

		// append the length
		b.push(Math.floor(sha1._length / 0x100000000));
		b.push(sha1._length | 0);

		while (b.length) {
			sha1._block(b.splice(0, 16));
		}

		sha1.reset();
		return h;
	}

	/**
	 * The SHA-1 logical functions f(0), f(1), ..., f(79).
	 * @private
	 */
	_f(t, b, c, d) {
		if (t <= 19) {
			return (b & c) | (~b & d);
		} else if (t <= 39) {
			return b ^ c ^ d;
		} else if (t <= 59) {
			return (b & c) | (b & d) | (c & d);
		} else if (t <= 79) {
			return b ^ c ^ d;
		}
	}

	/**
	 * Circular left-shift operator.
	 * @private
	 */
	_S(n, x) {
		return (x << n) | (x >>> 32 - n);
	}

	/**
	 * Perform one cycle of SHA-1.
	 * @param {Uint32Array|bitArray} words one block of words.
	 * @private
	 */
	_block(words) {
		const sha1 = this;
		const h = sha1._h;
		// When words is passed to _block, it has 16 elements. SHA1 _block
		// function extends words with new elements (at the end there are 80 elements). 
		// The problem is that if we use Uint32Array instead of Array, 
		// the length of Uint32Array cannot be changed. Thus, we replace words with a 
		// normal Array here.
		const w = Array(80); // do not use Uint32Array here as the instantiation is slower
		for (let j = 0; j < 16; j++) {
			w[j] = words[j];
		}

		let a = h[0];
		let b = h[1];
		let c = h[2];
		let d = h[3];
		let e = h[4];

		for (let t = 0; t <= 79; t++) {
			if (t >= 16) {
				w[t] = sha1._S(1, w[t - 3] ^ w[t - 8] ^ w[t - 14] ^ w[t - 16]);
			}
			const tmp = (sha1._S(5, a) + sha1._f(t, b, c, d) + e + w[t] +
				sha1._key[Math.floor(t / 20)]) | 0;
			e = d;
			d = c;
			c = sha1._S(30, b);
			b = a;
			a = tmp;
		}

		h[0] = (h[0] + a) | 0;
		h[1] = (h[1] + b) | 0;
		h[2] = (h[2] + c) | 0;
		h[3] = (h[3] + d) | 0;
		h[4] = (h[4] + e) | 0;
	}
};

/** @fileOverview Low-level AES implementation.
 *
 * This file contains a low-level implementation of AES, optimized for
 * size and for efficiency on several browsers.  It is based on
 * OpenSSL's aes_core.c, a public-domain implementation by Vincent
 * Rijmen, Antoon Bosselaers and Paulo Barreto.
 *
 * An older version of this implementation is available in the public
 * domain, but this one is (c) Emily Stark, Mike Hamburg, Dan Boneh,
 * Stanford University 2008-2010 and BSD-licensed for liability
 * reasons.
 *
 * @author Emily Stark
 * @author Mike Hamburg
 * @author Dan Boneh
 */

const cipher = {};

/**
 * Schedule out an AES key for both encryption and decryption.  This
 * is a low-level class.  Use a cipher mode to do bulk encryption.
 *
 * @constructor
 * @param {Array} key The key as an array of 4, 6 or 8 words.
 */
cipher.aes = class {
	constructor(key) {
		/**
		 * The expanded S-box and inverse S-box tables.  These will be computed
		 * on the client so that we don't have to send them down the wire.
		 *
		 * There are two tables, _tables[0] is for encryption and
		 * _tables[1] is for decryption.
		 *
		 * The first 4 sub-tables are the expanded S-box with MixColumns.  The
		 * last (_tables[01][4]) is the S-box itself.
		 *
		 * @private
		 */
		const aes = this;
		aes._tables = [[[], [], [], [], []], [[], [], [], [], []]];

		if (!aes._tables[0][0][0]) {
			aes._precompute();
		}

		const sbox = aes._tables[0][4];
		const decTable = aes._tables[1];
		const keyLen = key.length;

		let i, encKey, decKey, rcon = 1;

		if (keyLen !== 4 && keyLen !== 6 && keyLen !== 8) {
			throw new Error("invalid aes key size");
		}

		aes._key = [encKey = key.slice(0), decKey = []];

		// schedule encryption keys
		for (i = keyLen; i < 4 * keyLen + 28; i++) {
			let tmp = encKey[i - 1];

			// apply sbox
			if (i % keyLen === 0 || (keyLen === 8 && i % keyLen === 4)) {
				tmp = sbox[tmp >>> 24] << 24 ^ sbox[tmp >> 16 & 255] << 16 ^ sbox[tmp >> 8 & 255] << 8 ^ sbox[tmp & 255];

				// shift rows and add rcon
				if (i % keyLen === 0) {
					tmp = tmp << 8 ^ tmp >>> 24 ^ rcon << 24;
					rcon = rcon << 1 ^ (rcon >> 7) * 283;
				}
			}

			encKey[i] = encKey[i - keyLen] ^ tmp;
		}

		// schedule decryption keys
		for (let j = 0; i; j++, i--) {
			const tmp = encKey[j & 3 ? i : i - 4];
			if (i <= 4 || j < 4) {
				decKey[j] = tmp;
			} else {
				decKey[j] = decTable[0][sbox[tmp >>> 24]] ^
					decTable[1][sbox[tmp >> 16 & 255]] ^
					decTable[2][sbox[tmp >> 8 & 255]] ^
					decTable[3][sbox[tmp & 255]];
			}
		}
	}
	// public
	/* Something like this might appear here eventually
	name: "AES",
	blockSize: 4,
	keySizes: [4,6,8],
	*/

	/**
	 * Encrypt an array of 4 big-endian words.
	 * @param {Array} data The plaintext.
	 * @return {Array} The ciphertext.
	 */
	encrypt(data) {
		return this._crypt(data, 0);
	}

	/**
	 * Decrypt an array of 4 big-endian words.
	 * @param {Array} data The ciphertext.
	 * @return {Array} The plaintext.
	 */
	decrypt(data) {
		return this._crypt(data, 1);
	}

	/**
	 * Expand the S-box tables.
	 *
	 * @private
	 */
	_precompute() {
		const encTable = this._tables[0];
		const decTable = this._tables[1];
		const sbox = encTable[4];
		const sboxInv = decTable[4];
		const d = [];
		const th = [];
		let xInv, x2, x4, x8;

		// Compute double and third tables
		for (let i = 0; i < 256; i++) {
			th[(d[i] = i << 1 ^ (i >> 7) * 283) ^ i] = i;
		}

		for (let x = xInv = 0; !sbox[x]; x ^= x2 || 1, xInv = th[xInv] || 1) {
			// Compute sbox
			let s = xInv ^ xInv << 1 ^ xInv << 2 ^ xInv << 3 ^ xInv << 4;
			s = s >> 8 ^ s & 255 ^ 99;
			sbox[x] = s;
			sboxInv[s] = x;

			// Compute MixColumns
			x8 = d[x4 = d[x2 = d[x]]];
			let tDec = x8 * 0x1010101 ^ x4 * 0x10001 ^ x2 * 0x101 ^ x * 0x1010100;
			let tEnc = d[s] * 0x101 ^ s * 0x1010100;

			for (let i = 0; i < 4; i++) {
				encTable[i][x] = tEnc = tEnc << 24 ^ tEnc >>> 8;
				decTable[i][s] = tDec = tDec << 24 ^ tDec >>> 8;
			}
		}

		// Compactify.  Considerable speedup on Firefox.
		for (let i = 0; i < 5; i++) {
			encTable[i] = encTable[i].slice(0);
			decTable[i] = decTable[i].slice(0);
		}
	}

	/**
	 * Encryption and decryption core.
	 * @param {Array} input Four words to be encrypted or decrypted.
	 * @param dir The direction, 0 for encrypt and 1 for decrypt.
	 * @return {Array} The four encrypted or decrypted words.
	 * @private
	 */
	_crypt(input, dir) {
		if (input.length !== 4) {
			throw new Error("invalid aes block size");
		}

		const key = this._key[dir];

		const nInnerRounds = key.length / 4 - 2;
		const out = [0, 0, 0, 0];
		const table = this._tables[dir];

		// load up the tables
		const t0 = table[0];
		const t1 = table[1];
		const t2 = table[2];
		const t3 = table[3];
		const sbox = table[4];

		// state variables a,b,c,d are loaded with pre-whitened data
		let a = input[0] ^ key[0];
		let b = input[dir ? 3 : 1] ^ key[1];
		let c = input[2] ^ key[2];
		let d = input[dir ? 1 : 3] ^ key[3];
		let kIndex = 4;
		let a2, b2, c2;

		// Inner rounds.  Cribbed from OpenSSL.
		for (let i = 0; i < nInnerRounds; i++) {
			a2 = t0[a >>> 24] ^ t1[b >> 16 & 255] ^ t2[c >> 8 & 255] ^ t3[d & 255] ^ key[kIndex];
			b2 = t0[b >>> 24] ^ t1[c >> 16 & 255] ^ t2[d >> 8 & 255] ^ t3[a & 255] ^ key[kIndex + 1];
			c2 = t0[c >>> 24] ^ t1[d >> 16 & 255] ^ t2[a >> 8 & 255] ^ t3[b & 255] ^ key[kIndex + 2];
			d = t0[d >>> 24] ^ t1[a >> 16 & 255] ^ t2[b >> 8 & 255] ^ t3[c & 255] ^ key[kIndex + 3];
			kIndex += 4;
			a = a2; b = b2; c = c2;
		}

		// Last round.
		for (let i = 0; i < 4; i++) {
			out[dir ? 3 & -i : i] =
				sbox[a >>> 24] << 24 ^
				sbox[b >> 16 & 255] << 16 ^
				sbox[c >> 8 & 255] << 8 ^
				sbox[d & 255] ^
				key[kIndex++];
			a2 = a; a = b; b = c; c = d; d = a2;
		}

		return out;
	}
};

/** @fileOverview CTR mode implementation.
 *
 * Special thanks to Roy Nicholson for pointing out a bug in our
 * implementation.
 *
 * @author Emily Stark
 * @author Mike Hamburg
 * @author Dan Boneh
 */

/** Brian Gladman's CTR Mode.
* @constructor
* @param {Object} _prf The aes instance to generate key.
* @param {bitArray} _iv The iv for ctr mode, it must be 128 bits.
*/

const mode = {};

/**
 * Brian Gladman's CTR Mode.
 * @namespace
 */
mode.ctrGladman = class {
	constructor(prf, iv) {
		this._prf = prf;
		this._initIv = iv;
		this._iv = iv;
	}

	reset() {
		this._iv = this._initIv;
	}

	/** Input some data to calculate.
	 * @param {bitArray} data the data to process, it must be intergral multiple of 128 bits unless it's the last.
	 */
	update(data) {
		return this.calculate(this._prf, data, this._iv);
	}

	incWord(word) {
		if (((word >> 24) & 0xff) === 0xff) { //overflow
			let b1 = (word >> 16) & 0xff;
			let b2 = (word >> 8) & 0xff;
			let b3 = word & 0xff;

			if (b1 === 0xff) { // overflow b1   
				b1 = 0;
				if (b2 === 0xff) {
					b2 = 0;
					if (b3 === 0xff) {
						b3 = 0;
					} else {
						++b3;
					}
				} else {
					++b2;
				}
			} else {
				++b1;
			}

			word = 0;
			word += (b1 << 16);
			word += (b2 << 8);
			word += b3;
		} else {
			word += (0x01 << 24);
		}
		return word;
	}

	incCounter(counter) {
		if ((counter[0] = this.incWord(counter[0])) === 0) {
			// encr_data in fileenc.c from  Dr Brian Gladman's counts only with DWORD j < 8
			counter[1] = this.incWord(counter[1]);
		}
	}

	calculate(prf, data, iv) {
		let l;
		if (!(l = data.length)) {
			return [];
		}
		const bl = bitArray.bitLength(data);
		for (let i = 0; i < l; i += 4) {
			this.incCounter(iv);
			const e = prf.encrypt(iv);
			data[i] ^= e[0];
			data[i + 1] ^= e[1];
			data[i + 2] ^= e[2];
			data[i + 3] ^= e[3];
		}
		return bitArray.clamp(data, bl);
	}
};

const misc = {
	importKey(password) {
		return new misc.hmacSha1(codec.bytes.toBits(password));
	},
	pbkdf2(prf, salt, count, length) {
		count = count || 10000;
		if (length < 0 || count < 0) {
			throw new Error("invalid params to pbkdf2");
		}
		const byteLength = ((length >> 5) + 1) << 2;
		let u, ui, i, j, k;
		const arrayBuffer = new ArrayBuffer(byteLength);
		const out = new DataView(arrayBuffer);
		let outLength = 0;
		const b = bitArray;
		salt = codec.bytes.toBits(salt);
		for (k = 1; outLength < (byteLength || 1); k++) {
			u = ui = prf.encrypt(b.concat(salt, [k]));
			for (i = 1; i < count; i++) {
				ui = prf.encrypt(ui);
				for (j = 0; j < ui.length; j++) {
					u[j] ^= ui[j];
				}
			}
			for (i = 0; outLength < (byteLength || 1) && i < u.length; i++) {
				out.setInt32(outLength, u[i]);
				outLength += 4;
			}
		}
		return arrayBuffer.slice(0, length / 8);
	}
};

/** @fileOverview HMAC implementation.
 *
 * @author Emily Stark
 * @author Mike Hamburg
 * @author Dan Boneh
 */

/** HMAC with the specified hash function.
 * @constructor
 * @param {bitArray} key the key for HMAC.
 * @param {Object} [Hash=hash.sha1] The hash function to use.
 */
misc.hmacSha1 = class {

	constructor(key) {
		const hmac = this;
		const Hash = hmac._hash = hash.sha1;
		const exKey = [[], []];
		hmac._baseHash = [new Hash(), new Hash()];
		const bs = hmac._baseHash[0].blockSize / 32;

		if (key.length > bs) {
			key = new Hash().update(key).finalize();
		}

		for (let i = 0; i < bs; i++) {
			exKey[0][i] = key[i] ^ 0x36363636;
			exKey[1][i] = key[i] ^ 0x5C5C5C5C;
		}

		hmac._baseHash[0].update(exKey[0]);
		hmac._baseHash[1].update(exKey[1]);
		hmac._resultHash = new Hash(hmac._baseHash[0]);
	}
	reset() {
		const hmac = this;
		hmac._resultHash = new hmac._hash(hmac._baseHash[0]);
		hmac._updated = false;
	}

	update(data) {
		const hmac = this;
		hmac._updated = true;
		hmac._resultHash.update(data);
	}

	digest() {
		const hmac = this;
		const w = hmac._resultHash.finalize();
		const result = new (hmac._hash)(hmac._baseHash[1]).update(w).finalize();

		hmac.reset();

		return result;
	}

	encrypt(data) {
		if (!this._updated) {
			this.update(data);
			return this.digest(data);
		} else {
			throw new Error("encrypt on already updated hmac called!");
		}
	}
};

/*
 Copyright (c) 2022 Gildas Lormeau. All rights reserved.

 Redistribution and use in source and binary forms, with or without
 modification, are permitted provided that the following conditions are met:

 1. Redistributions of source code must retain the above copyright notice,
 this list of conditions and the following disclaimer.

 2. Redistributions in binary form must reproduce the above copyright 
 notice, this list of conditions and the following disclaimer in 
 the documentation and/or other materials provided with the distribution.

 3. The names of the authors may not be used to endorse or promote products
 derived from this software without specific prior written permission.

 THIS SOFTWARE IS PROVIDED ''AS IS'' AND ANY EXPRESSED OR IMPLIED WARRANTIES,
 INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND
 FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL JCRAFT,
 INC. OR ANY CONTRIBUTORS TO THIS SOFTWARE BE LIABLE FOR ANY DIRECT, INDIRECT,
 INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA,
 OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
 LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
 EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */


const GET_RANDOM_VALUES_SUPPORTED = typeof crypto != UNDEFINED_TYPE && typeof crypto.getRandomValues == FUNCTION_TYPE;

const ERR_INVALID_PASSWORD = "Invalid password";
const ERR_INVALID_SIGNATURE = "Invalid signature";
const ERR_ABORT_CHECK_PASSWORD = "zipjs-abort-check-password";
const ERR_UNSUPPORTED_CRYPTO_API = "Crypto API not supported";

function getRandomValues(array) {
	if (GET_RANDOM_VALUES_SUPPORTED) {
		return crypto.getRandomValues(array);
	} else {
		throw new Error(ERR_UNSUPPORTED_CRYPTO_API);
	}
}

/*
 Copyright (c) 2022 Gildas Lormeau. All rights reserved.

 Redistribution and use in source and binary forms, with or without
 modification, are permitted provided that the following conditions are met:

 1. Redistributions of source code must retain the above copyright notice,
 this list of conditions and the following disclaimer.

 2. Redistributions in binary form must reproduce the above copyright 
 notice, this list of conditions and the following disclaimer in 
 the documentation and/or other materials provided with the distribution.

 3. The names of the authors may not be used to endorse or promote products
 derived from this software without specific prior written permission.

 THIS SOFTWARE IS PROVIDED ''AS IS'' AND ANY EXPRESSED OR IMPLIED WARRANTIES,
 INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND
 FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL JCRAFT,
 INC. OR ANY CONTRIBUTORS TO THIS SOFTWARE BE LIABLE FOR ANY DIRECT, INDIRECT,
 INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA,
 OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
 LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
 EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */


const BLOCK_LENGTH = 16;
const RAW_FORMAT = "raw";
const PBKDF2_ALGORITHM = { name: "PBKDF2" };
const HASH_ALGORITHM = { name: "HMAC" };
const HASH_FUNCTION = "SHA-1";
const BASE_KEY_ALGORITHM = Object.assign({ hash: HASH_ALGORITHM }, PBKDF2_ALGORITHM);
const DERIVED_BITS_ALGORITHM = Object.assign({ iterations: 1000, hash: { name: HASH_FUNCTION } }, PBKDF2_ALGORITHM);
const DERIVED_BITS_USAGE = ["deriveBits"];
const SALT_LENGTH = [8, 12, 16];
const KEY_LENGTH = [16, 24, 32];
const SIGNATURE_LENGTH = 10;
const COUNTER_DEFAULT_VALUE = [0, 0, 0, 0];
// deno-lint-ignore valid-typeof
const CRYPTO_API_SUPPORTED = typeof crypto != UNDEFINED_TYPE;
const subtle = CRYPTO_API_SUPPORTED && crypto.subtle;
const SUBTLE_API_SUPPORTED = CRYPTO_API_SUPPORTED && typeof subtle != UNDEFINED_TYPE;
const codecBytes = codec.bytes;
const Aes = cipher.aes;
const CtrGladman = mode.ctrGladman;
const HmacSha1 = misc.hmacSha1;

let IMPORT_KEY_SUPPORTED = CRYPTO_API_SUPPORTED && SUBTLE_API_SUPPORTED && typeof subtle.importKey == FUNCTION_TYPE;
let DERIVE_BITS_SUPPORTED = CRYPTO_API_SUPPORTED && SUBTLE_API_SUPPORTED && typeof subtle.deriveBits == FUNCTION_TYPE;

class AESDecryptionStream extends TransformStream {

	constructor({ password, rawPassword, encryptionStrength, checkPasswordOnly }) {
		super({
			start() {
				initAesCrypto(this, password, rawPassword, encryptionStrength);
			},
			async transform(chunk, controller) {
				const aesCrypto = this;
				const {
					password,
					strength,
					resolveReady,
					ready
				} = aesCrypto;
				if (password) {
					await createDecryptionKeys(aesCrypto, strength, password, subarray(chunk, 0, SALT_LENGTH[strength] + 2));
					chunk = subarray(chunk, SALT_LENGTH[strength] + 2);
					if (checkPasswordOnly) {
						controller.error(new Error(ERR_ABORT_CHECK_PASSWORD));
					} else {
						resolveReady();
					}
				} else {
					await ready;
				}
				const output = new Uint8Array(chunk.length - SIGNATURE_LENGTH - ((chunk.length - SIGNATURE_LENGTH) % BLOCK_LENGTH));
				controller.enqueue(append(aesCrypto, chunk, output, 0, SIGNATURE_LENGTH, true));
			},
			async flush(controller) {
				const {
					ctr,
					hmac,
					pending,
					ready
				} = this;
				if (hmac && ctr) {
					await ready;
					const chunkToDecrypt = subarray(pending, 0, pending.length - SIGNATURE_LENGTH);
					const originalSignature = subarray(pending, pending.length - SIGNATURE_LENGTH);
					let decryptedChunkArray = EMPTY_UINT8_ARRAY;
					if (chunkToDecrypt.length) {
						const encryptedChunk = toBits(codecBytes, chunkToDecrypt);
						hmac.update(encryptedChunk);
						const decryptedChunk = ctr.update(encryptedChunk);
						decryptedChunkArray = fromBits(codecBytes, decryptedChunk);
					}
					const signature = subarray(fromBits(codecBytes, hmac.digest()), 0, SIGNATURE_LENGTH);
					let invalidSignature = pending.length < SIGNATURE_LENGTH ? 1 : 0;
					for (let indexSignature = 0; indexSignature < SIGNATURE_LENGTH; indexSignature++) {
						invalidSignature |= signature[indexSignature] ^ originalSignature[indexSignature];
					}
					if (invalidSignature) {
						throw new Error(ERR_INVALID_SIGNATURE);
					}
					controller.enqueue(decryptedChunkArray);
				}
			}
		});
	}
}

class AESEncryptionStream extends TransformStream {

	constructor({ password, rawPassword, encryptionStrength }) {
		// deno-lint-ignore prefer-const
		let stream;
		super({
			start() {
				initAesCrypto(this, password, rawPassword, encryptionStrength);
			},
			async transform(chunk, controller) {
				const aesCrypto = this;
				const {
					password,
					strength,
					resolveReady,
					ready
				} = aesCrypto;
				let preamble = EMPTY_UINT8_ARRAY;
				if (password) {
					preamble = await createEncryptionKeys(aesCrypto, strength, password);
					resolveReady();
				} else {
					await ready;
				}
				const output = new Uint8Array(preamble.length + chunk.length - (chunk.length % BLOCK_LENGTH));
				output.set(preamble, 0);
				controller.enqueue(append(aesCrypto, chunk, output, preamble.length, 0));
			},
			async flush(controller) {
				const {
					ctr,
					hmac,
					pending,
					ready
				} = this;
				if (hmac && ctr) {
					await ready;
					let encryptedChunkArray = EMPTY_UINT8_ARRAY;
					if (pending.length) {
						const encryptedChunk = ctr.update(toBits(codecBytes, pending));
						hmac.update(encryptedChunk);
						encryptedChunkArray = fromBits(codecBytes, encryptedChunk);
					}
					stream.signature = fromBits(codecBytes, hmac.digest()).slice(0, SIGNATURE_LENGTH);
					controller.enqueue(concat(encryptedChunkArray, stream.signature));
				}
			}
		});
		stream = this;
	}
}

function initAesCrypto(aesCrypto, password, rawPassword, encryptionStrength) {
	Object.assign(aesCrypto, {
		ready: new Promise(resolve => aesCrypto.resolveReady = resolve),
		password: encodePassword(password, rawPassword),
		strength: encryptionStrength - 1,
		pending: EMPTY_UINT8_ARRAY
	});
}

function append(aesCrypto, input, output, paddingStart, paddingEnd, verifySignature) {
	const {
		ctr,
		hmac,
		pending
	} = aesCrypto;
	if (pending.length) {
		input = concat(pending, input);
	}
	const inputLength = input.length - paddingEnd;
	output = expand(output, paddingStart + (inputLength - (inputLength % BLOCK_LENGTH)));
	let offset;
	for (offset = 0; offset <= inputLength - BLOCK_LENGTH; offset += BLOCK_LENGTH) {
		const inputChunk = toBits(codecBytes, subarray(input, offset, offset + BLOCK_LENGTH));
		if (verifySignature) {
			hmac.update(inputChunk);
		}
		const outputChunk = ctr.update(inputChunk);
		if (!verifySignature) {
			hmac.update(outputChunk);
		}
		output.set(fromBits(codecBytes, outputChunk), offset + paddingStart);
	}
	aesCrypto.pending = subarray(input, offset);
	return output;
}

async function createDecryptionKeys(decrypt, strength, password, preamble) {
	const passwordVerificationKey = await createKeys$1(decrypt, strength, password, subarray(preamble, 0, SALT_LENGTH[strength]));
	const passwordVerification = subarray(preamble, SALT_LENGTH[strength]);
	if (passwordVerificationKey[0] != passwordVerification[0] || passwordVerificationKey[1] != passwordVerification[1]) {
		throw new Error(ERR_INVALID_PASSWORD);
	}
}

async function createEncryptionKeys(encrypt, strength, password) {
	const salt = getRandomValues(new Uint8Array(SALT_LENGTH[strength]));
	const passwordVerification = await createKeys$1(encrypt, strength, password, salt);
	return concat(salt, passwordVerification);
}

async function createKeys$1(aesCrypto, strength, password, salt) {
	aesCrypto.password = null;
	const baseKey = await importKey(RAW_FORMAT, password, BASE_KEY_ALGORITHM, false, DERIVED_BITS_USAGE);
	const derivedBits = await deriveBits(Object.assign({ salt }, DERIVED_BITS_ALGORITHM), baseKey, 8 * ((KEY_LENGTH[strength] * 2) + 2));
	const compositeKey = new Uint8Array(derivedBits);
	const key = toBits(codecBytes, subarray(compositeKey, 0, KEY_LENGTH[strength]));
	const authentication = toBits(codecBytes, subarray(compositeKey, KEY_LENGTH[strength], KEY_LENGTH[strength] * 2));
	const passwordVerification = subarray(compositeKey, KEY_LENGTH[strength] * 2);
	Object.assign(aesCrypto, {
		keys: {
			key,
			authentication,
			passwordVerification
		},
		ctr: new CtrGladman(new Aes(key), Array.from(COUNTER_DEFAULT_VALUE)),
		hmac: new HmacSha1(authentication)
	});
	return passwordVerification;
}

async function importKey(format, password, algorithm, extractable, keyUsages) {
	if (IMPORT_KEY_SUPPORTED) {
		try {
			return await subtle.importKey(format, password, algorithm, extractable, keyUsages);
		} catch {
			IMPORT_KEY_SUPPORTED = false;
			return misc.importKey(password);
		}
	} else {
		return misc.importKey(password);
	}
}

async function deriveBits(algorithm, baseKey, length) {
	if (DERIVE_BITS_SUPPORTED) {
		try {
			return await subtle.deriveBits(algorithm, baseKey, length);
		} catch {
			DERIVE_BITS_SUPPORTED = false;
			return misc.pbkdf2(baseKey, algorithm.salt, DERIVED_BITS_ALGORITHM.iterations, length);
		}
	} else {
		return misc.pbkdf2(baseKey, algorithm.salt, DERIVED_BITS_ALGORITHM.iterations, length);
	}
}

function encodePassword(password, rawPassword) {
	if (rawPassword === UNDEFINED_VALUE) {
		return encodeText(password);
	} else {
		return rawPassword;
	}
}

function concat(leftArray, rightArray) {
	let array = leftArray;
	if (leftArray.length + rightArray.length) {
		array = new Uint8Array(leftArray.length + rightArray.length);
		array.set(leftArray, 0);
		array.set(rightArray, leftArray.length);
	}
	return array;
}

function expand(inputArray, length) {
	if (length && length > inputArray.length) {
		const array = inputArray;
		inputArray = new Uint8Array(length);
		inputArray.set(array, 0);
	}
	return inputArray;
}

function subarray(array, begin, end) {
	return array.subarray(begin, end);
}

function fromBits(codecBytes, chunk) {
	return codecBytes.fromBits(chunk);
}
function toBits(codecBytes, chunk) {
	return codecBytes.toBits(chunk);
}

/*
 Copyright (c) 2022 Gildas Lormeau. All rights reserved.

 Redistribution and use in source and binary forms, with or without
 modification, are permitted provided that the following conditions are met:

 1. Redistributions of source code must retain the above copyright notice,
 this list of conditions and the following disclaimer.

 2. Redistributions in binary form must reproduce the above copyright 
 notice, this list of conditions and the following disclaimer in 
 the documentation and/or other materials provided with the distribution.

 3. The names of the authors may not be used to endorse or promote products
 derived from this software without specific prior written permission.

 THIS SOFTWARE IS PROVIDED ''AS IS'' AND ANY EXPRESSED OR IMPLIED WARRANTIES,
 INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND
 FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL JCRAFT,
 INC. OR ANY CONTRIBUTORS TO THIS SOFTWARE BE LIABLE FOR ANY DIRECT, INDIRECT,
 INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA,
 OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
 LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
 EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */


const HEADER_LENGTH = 12;

class ZipCryptoDecryptionStream extends TransformStream {

	constructor({ password, rawPassword, passwordVerification, checkPasswordOnly }) {
		super({
			start() {
				initZipCrypto(this, password, rawPassword, passwordVerification);
			},
			transform(chunk, controller) {
				const zipCrypto = this;
				if (zipCrypto.password || zipCrypto.rawPassword) {
					const decryptedHeader = decrypt(zipCrypto, chunk.subarray(0, HEADER_LENGTH));
					zipCrypto.password = zipCrypto.rawPassword = null;
					if ((decryptedHeader.at(-1) ^ zipCrypto.passwordVerification) != 0) {
						throw new Error(ERR_INVALID_PASSWORD);
					}
					chunk = chunk.subarray(HEADER_LENGTH);
				}
				if (checkPasswordOnly) {
					controller.error(new Error(ERR_ABORT_CHECK_PASSWORD));
				} else {
					controller.enqueue(decrypt(zipCrypto, chunk));
				}
			}
		});
	}
}

class ZipCryptoEncryptionStream extends TransformStream {

	constructor({ password, rawPassword, passwordVerification }) {
		super({
			start() {
				initZipCrypto(this, password, rawPassword, passwordVerification);
			},
			transform(chunk, controller) {
				const zipCrypto = this;
				let output;
				let offset;
				if (zipCrypto.password || zipCrypto.rawPassword) {
					zipCrypto.password = zipCrypto.rawPassword = null;
					const header = getRandomValues(new Uint8Array(HEADER_LENGTH));
					header[HEADER_LENGTH - 1] = zipCrypto.passwordVerification;
					output = new Uint8Array(chunk.length + header.length);
					output.set(encrypt(zipCrypto, header), 0);
					offset = HEADER_LENGTH;
				} else {
					output = new Uint8Array(chunk.length);
					offset = 0;
				}
				output.set(encrypt(zipCrypto, chunk), offset);
				controller.enqueue(output);
			}
		});
	}
}

function initZipCrypto(zipCrypto, password, rawPassword, passwordVerification) {
	Object.assign(zipCrypto, {
		password,
		rawPassword,
		passwordVerification
	});
	createKeys(zipCrypto, password, rawPassword);
}

function decrypt(target, input) {
	const output = new Uint8Array(input.length);
	for (let index = 0; index < input.length; index++) {
		output[index] = getByte(target) ^ input[index];
		updateKeys(target, output[index]);
	}
	return output;
}

function encrypt(target, input) {
	const output = new Uint8Array(input.length);
	for (let index = 0; index < input.length; index++) {
		output[index] = getByte(target) ^ input[index];
		updateKeys(target, input[index]);
	}
	return output;
}

function createKeys(target, password, rawPassword) {
	const keys = [0x12345678, 0x23456789, 0x34567890];
	Object.assign(target, {
		keys,
		crcKey0: new Crc32(keys[0]),
		crcKey2: new Crc32(keys[2])
	});
	if (rawPassword) {
		for (let index = 0; index < rawPassword.length; index++) {
			updateKeys(target, rawPassword[index]);
		}
	} else {
		for (let index = 0; index < password.length; index++) {
			updateKeys(target, password.charCodeAt(index));
		}
	}
}

function updateKeys(target, byte) {
	let [, key1] = target.keys;
	target.crcKey0.append([byte]);
	const key0 = ~target.crcKey0.get();
	key1 = getInt32(Math.imul(getInt32(key1 + getInt8(key0)), 134775813) + 1);
	target.crcKey2.append([key1 >>> 24]);
	const key2 = ~target.crcKey2.get();
	target.keys = [key0, key1, key2];
}

function getByte(target) {
	const temp = target.keys[2] | 2;
	return getInt8(Math.imul(temp, (temp ^ 1)) >>> 8);
}

function getInt8(number) {
	return number & 0xFF;
}

function getInt32(number) {
	return number & 0xFFFFFFFF;
}

/*
 Copyright (c) 2025 Gildas Lormeau. All rights reserved.

 Redistribution and use in source and binary forms, with or without
 modification, are permitted provided that the following conditions are met:

 1. Redistributions of source code must retain the above copyright notice,
 this list of conditions and the following disclaimer.

 2. Redistributions in binary form must reproduce the above copyright 
 notice, this list of conditions and the following disclaimer in 
 the documentation and/or other materials provided with the distribution.

 3. The names of the authors may not be used to endorse or promote products
 derived from this software without specific prior written permission.

 THIS SOFTWARE IS PROVIDED ''AS IS'' AND ANY EXPRESSED OR IMPLIED WARRANTIES,
 INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND
 FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL JCRAFT,
 INC. OR ANY CONTRIBUTORS TO THIS SOFTWARE BE LIABLE FOR ANY DIRECT, INDIRECT,
 INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA,
 OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
 LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
 EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */


const ERR_INVALID_UNCOMPRESSED_SIZE = "Invalid uncompressed size";
const ERR_INVALID_COMPRESSED_DATA = "Invalid compressed data";
const FORMAT_DEFLATE_RAW = "deflate-raw";
const FORMAT_DEFLATE64_RAW = "deflate64-raw";
const FORMAT_GZIP = "gzip";
const GZIP_HEADER_LENGTH = 10;
const GZIP_TRAILER_LENGTH = 8;

class DeflateStream extends TransformStream {

	constructor(options, { chunkSize, CompressionStreamZlib, CompressionStream }) {
		super({});
		const { compressed, encrypted, useCompressionStream, zipCrypto, signed, level, deflate64 } = options;
		const stream = this;
		let crc32Stream, encryptionStream, gzipCrc32Stream;
		let readable = super.readable;
		const useGzipCrc32 = signed && compressed && !deflate64 && (!encrypted || zipCrypto) &&
			Boolean(useCompressionStream && CompressionStream);
		if ((!encrypted || zipCrypto) && signed && !useGzipCrc32) {
			crc32Stream = new Crc32Stream();
			readable = pipeThrough(readable, crc32Stream);
		}
		if (compressed) {
			if (useGzipCrc32) {
				gzipCrc32Stream = new GzipToRawDeflateStream();
				readable = pipeThroughBackpressured(readable, new CompressionStream(FORMAT_GZIP));
				readable = pipeThrough(readable, gzipCrc32Stream);
			} else {
				readable = pipeThroughCommpressionStream(readable, useCompressionStream, { level, chunkSize }, CompressionStream, CompressionStreamZlib, CompressionStream);
			}
		}
		if (encrypted) {
			if (zipCrypto) {
				readable = pipeThrough(readable, new ZipCryptoEncryptionStream(options));
			} else {
				encryptionStream = new AESEncryptionStream(options);
				readable = pipeThrough(readable, encryptionStream);
			}
		}
		setReadable(stream, readable, () => {
			let signature;
			if (encrypted && !zipCrypto) {
				signature = encryptionStream.signature;
			}
			if ((!encrypted || zipCrypto) && signed) {
				signature = useGzipCrc32 ? gzipCrc32Stream.signature : new DataView(crc32Stream.value.buffer).getUint32(0);
			}
			stream.signature = signature;
		});
	}
}

class GzipToRawDeflateStream extends TransformStream {

	constructor() {
		// deno-lint-ignore prefer-const
		let stream;
		let headerLeft = GZIP_HEADER_LENGTH;
		let tail = new Uint8Array(0);
		super({
			transform(chunk, controller) {
				if (headerLeft) {
					const dropped = Math.min(headerLeft, chunk.length);
					headerLeft -= dropped;
					chunk = chunk.subarray(dropped);
					if (!chunk.length) {
						return;
					}
				}
				const available = tail.length + chunk.length;
				if (available <= GZIP_TRAILER_LENGTH) {
					const pending = new Uint8Array(available);
					pending.set(tail);
					pending.set(chunk, tail.length);
					tail = pending;
					return;
				}
				const emitLength = available - GZIP_TRAILER_LENGTH;
				const output = new Uint8Array(emitLength);
				const fromTail = Math.min(emitLength, tail.length);
				output.set(tail.subarray(0, fromTail), 0);
				if (emitLength > fromTail) {
					output.set(chunk.subarray(0, emitLength - fromTail), fromTail);
				}
				controller.enqueue(output);
				const nextTail = new Uint8Array(GZIP_TRAILER_LENGTH);
				const tailRemaining = tail.length - fromTail;
				if (tailRemaining) {
					nextTail.set(tail.subarray(fromTail), 0);
				}
				nextTail.set(chunk.subarray(emitLength - fromTail), tailRemaining);
				tail = nextTail;
			},
			flush() {
				const dataView = new DataView(tail.buffer, tail.byteOffset, tail.byteLength);
				stream.signature = dataView.getUint32(0, true);
				stream.uncompressedSize = dataView.getUint32(4, true);
			}
		});
		stream = this;
	}
}

class InflateStream extends TransformStream {

	constructor(options, { chunkSize, DecompressionStreamZlib, DecompressionStream }) {
		super({});
		const { zipCrypto, encrypted, signed, signature, compressed, useCompressionStream, deflate64 } = options;
		let crc32Stream, decryptionStream;
		let readable = super.readable;
		if (encrypted) {
			if (zipCrypto) {
				readable = pipeThrough(readable, new ZipCryptoDecryptionStream(options));
			} else {
				decryptionStream = new AESDecryptionStream(options);
				readable = pipeThrough(readable, decryptionStream);
			}
		}
		if (compressed) {
			readable = pipeThroughCommpressionStream(readable, useCompressionStream, { chunkSize, deflate64 }, DecompressionStream, DecompressionStreamZlib, DecompressionStream);
			readable = mapInflateStreamError(readable);
		}
		if ((!encrypted || zipCrypto) && signed) {
			crc32Stream = new Crc32Stream();
			readable = pipeThrough(readable, crc32Stream);
		}
		setReadable(this, readable, () => {
			if ((!encrypted || zipCrypto) && signed) {
				const dataViewSignature = new DataView(crc32Stream.value.buffer);
				if (signature != dataViewSignature.getUint32(0, false)) {
					throw new Error(ERR_INVALID_SIGNATURE);
				}
			}
		});
	}
}

function setReadable(stream, readable, flush) {
	readable = pipeThrough(readable, new TransformStream({ flush }));
	Object.defineProperty(stream, "readable", {
		get() {
			return readable;
		}
	});
}

function pipeThroughCommpressionStream(readable, useCompressionStream, options, CompressionStreamNative, CompressionStreamZlib, CompressionStream) {
	const Stream = useCompressionStream && CompressionStreamNative ? CompressionStreamNative : CompressionStreamZlib || CompressionStream;
	const format = options.deflate64 ? FORMAT_DEFLATE64_RAW : FORMAT_DEFLATE_RAW;
	let codecStream;
	try {
		codecStream = new Stream(format, options);
	} catch (error) {
		if (useCompressionStream) {
			if (CompressionStreamZlib) {
				codecStream = new CompressionStreamZlib(format, options);
			} else if (CompressionStream) {
				codecStream = new CompressionStream(format, options);
			} else {
				throw error;
			}
		} else {
			throw error;
		}
	}
	return pipeThroughBackpressured(readable, codecStream);
}

function pipeThrough(readable, transformStream) {
	return readable.pipeThrough(transformStream);
}

function pipeThroughBackpressured(readable, transformStream) {
	const writer = transformStream.writable.getWriter();
	const reader = readable.getReader();
	pump();
	return transformStream.readable;

	async function pump() {
		try {
			for (; ;) {
				await writer.ready;
				const result = await reader.read();
				if (result.done) {
					await writer.close();
					break;
				}
				await writer.write(result.value);
			}
		} catch (error) {
			await abort(writer, error);
			await cancel(reader, error);
		}
	}
}

async function abort(writer, error) {
	try {
		await writer.abort(error);
	} catch {
		// ignored: the writable may already be errored/closed
	}
}

async function cancel(reader, error) {
	try {
		await reader.cancel(error);
	} catch {
		// ignored: the readable may already be errored/closed
	}
}

function mapInflateStreamError(readable) {
	const reader = readable.getReader();
	return new ReadableStream({
		async pull(controller) {
			let result;
			try {
				result = await reader.read();
			} catch (error) {
				if (error && error.message) {
					throw error;
				}
				const mappedError = new Error(ERR_INVALID_COMPRESSED_DATA);
				mappedError.cause = error;
				throw mappedError;
			}
			const { value, done } = result;
			if (done) {
				controller.close();
			} else {
				controller.enqueue(value);
			}
		},
		cancel(reason) {
			return reader.cancel(reason);
		}
	});
}

/*
 Copyright (c) 2022 Gildas Lormeau. All rights reserved.

 Redistribution and use in source and binary forms, with or without
 modification, are permitted provided that the following conditions are met:

 1. Redistributions of source code must retain the above copyright notice,
 this list of conditions and the following disclaimer.

 2. Redistributions in binary form must reproduce the above copyright 
 notice, this list of conditions and the following disclaimer in 
 the documentation and/or other materials provided with the distribution.

 3. The names of the authors may not be used to endorse or promote products
 derived from this software without specific prior written permission.

 THIS SOFTWARE IS PROVIDED ''AS IS'' AND ANY EXPRESSED OR IMPLIED WARRANTIES,
 INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND
 FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL JCRAFT,
 INC. OR ANY CONTRIBUTORS TO THIS SOFTWARE BE LIABLE FOR ANY DIRECT, INDIRECT,
 INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA,
 OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
 LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
 EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */


const DEFAULT_CHUNK_SIZE$1 = 64 * 1024;
const MESSAGE_EVENT_TYPE = "message";
const MESSAGE_START = "start";
const MESSAGE_PULL = "pull";
const MESSAGE_DATA = "data";
const MESSAGE_ACK_DATA = "ack";
const MESSAGE_CLOSE = "close";
const CODEC_DEFLATE = "deflate";
const CODEC_INFLATE = "inflate";

class CodecStream extends TransformStream {

	constructor(options, config) {
		super({});
		const codec = this;
		const { codecType } = options;
		let Stream;
		if (codecType.startsWith(CODEC_DEFLATE)) {
			Stream = DeflateStream;
		} else if (codecType.startsWith(CODEC_INFLATE)) {
			Stream = InflateStream;
		}
		codec.outputSize = 0;
		let inputSize = 0;
		const stream = new Stream(options, config);
		const readable = super.readable;
		const inputSizeStream = new TransformStream({
			transform(chunk, controller) {
				if (chunk && chunk.length) {
					inputSize += chunk.length;
					controller.enqueue(chunk);
				}
			},
			flush() {
				Object.assign(codec, {
					inputSize
				});
			}
		});
		const outputSizeStream = new TransformStream({
			transform(chunk, controller) {
				if (chunk && chunk.length) {
					controller.enqueue(chunk);
					codec.outputSize += chunk.length;
					if (options.outputSize !== UNDEFINED_VALUE && codec.outputSize > options.outputSize) {
						throw new Error(ERR_INVALID_UNCOMPRESSED_SIZE);
					}
				}
			},
			flush() {
				const { signature } = stream;
				Object.assign(codec, {
					signature,
					inputSize
				});
			}
		});
		Object.defineProperty(codec, "readable", {
			get() {
				return readable.pipeThrough(inputSizeStream).pipeThrough(stream).pipeThrough(outputSizeStream);
			}
		});
	}
}

class ChunkStream extends TransformStream {

	constructor(chunkSize) {
		let pendingChunk;
		if (!(chunkSize >= 1)) {
			chunkSize = DEFAULT_CHUNK_SIZE$1;
		}
		super({
			transform,
			flush(controller) {
				if (pendingChunk && pendingChunk.length) {
					controller.enqueue(pendingChunk);
				}
			}
		});

		function transform(chunk, controller) {
			if (pendingChunk) {
				const newChunk = new Uint8Array(pendingChunk.length + chunk.length);
				newChunk.set(pendingChunk);
				newChunk.set(chunk, pendingChunk.length);
				chunk = newChunk;
				pendingChunk = null;
			}
			let offset = 0;
			while (chunk.length - offset > chunkSize) {
				controller.enqueue(chunk.slice(offset, offset + chunkSize));
				offset += chunkSize;
			}
			pendingChunk = offset ? chunk.slice(offset) : chunk;
		}
	}
}

/*
 Copyright (c) 2025 Gildas Lormeau. All rights reserved.

 Redistribution and use in source and binary forms, with or without
 modification, are permitted provided that the following conditions are met:

 1. Redistributions of source code must retain the above copyright notice,
 this list of conditions and the following disclaimer.

 2. Redistributions in binary form must reproduce the above copyright 
 notice, this list of conditions and the following disclaimer in 
 the documentation and/or other materials provided with the distribution.

 3. The names of the authors may not be used to endorse or promote products
 derived from this software without specific prior written permission.

 THIS SOFTWARE IS PROVIDED ''AS IS'' AND ANY EXPRESSED OR IMPLIED WARRANTIES,
 INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND
 FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL JCRAFT,
 INC. OR ANY CONTRIBUTORS TO THIS SOFTWARE BE LIABLE FOR ANY DIRECT, INDIRECT,
 INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA,
 OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
 LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
 EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */


const MODULE_WORKER_OPTIONS = { type: "module" };
const ERROR_EVENT_TYPE = "error";
const MESSAGE_ERROR_EVENT_TYPE = "messageerror";

let webWorkerSupported, webWorkerSource, webWorkerURI, webWorkerOptions;
let transferStreamsSupported = true;
try {
	transferStreamsSupported = typeof structuredClone == FUNCTION_TYPE && structuredClone(new DOMException("", "AbortError")).code !== UNDEFINED_VALUE;
} catch {
	// ignored
}
let initModule = () => { };

class CodecWorker {

	constructor(workerData, { readable, writable }, { options, config, streamOptions, useWebWorkers, transferStreams, workerURI }, onTaskFinished) {
		const { signal } = streamOptions;
		Object.assign(workerData, {
			busy: true,
			generation: (workerData.generation || 0) + 1,
			readable: readable
				.pipeThrough(new ChunkStream(getChunkSize(config)))
				.pipeThrough(new ProgressWatcherStream(streamOptions), { signal }),
			writable,
			options: Object.assign({}, options),
			workerURI,
			transferStreams,
			terminate() {
				return new Promise(resolve => {
					const { worker, busy } = workerData;
					if (worker) {
						if (busy) {
							workerData.resolveTerminated = resolve;
						} else {
							worker.terminate();
							resolve();
						}
						workerData.interface = null;
					} else {
						resolve();
					}
				});
			},
			onTaskFinished() {
				if (workerData.busy) {
					const { resolveTerminated } = workerData;
					if (resolveTerminated) {
						workerData.resolveTerminated = null;
						workerData.terminated = true;
						workerData.worker.terminate();
						resolveTerminated();
					}
					workerData.busy = false;
					onTaskFinished(workerData);
				}
			}
		});
		if (webWorkerSupported === UNDEFINED_VALUE) {
			// deno-lint-ignore valid-typeof
			webWorkerSupported = typeof Worker != UNDEFINED_TYPE;
		}
		return (useWebWorkers && webWorkerSupported ? createWebWorkerInterface : createWorkerInterface)(workerData, config);
	}
}

class ProgressWatcherStream extends TransformStream {

	constructor({ onstart, onprogress, size, onend }) {
		let chunkOffset = 0;
		super({
			async start() {
				if (onstart) {
					await callHandler(onstart, size);
				}
			},
			async transform(chunk, controller) {
				chunkOffset += chunk.length;
				if (onprogress) {
					await callHandler(onprogress, chunkOffset, size);
				}
				controller.enqueue(chunk);
			},
			async flush() {
				if (onend) {
					await callHandler(onend, chunkOffset);
				}
			}
		});
	}
}

async function callHandler(handler, ...parameters) {
	try {
		await handler(...parameters);
	} catch {
		// ignored
	}
}

function createWorkerInterface(workerData, config) {
	return {
		run: () => runWorker$1(workerData, config)
	};
}

function createWebWorkerInterface(workerData, config) {
	const { baseURI, chunkSize } = config;
	let { wasmURI } = config;

	if (!workerData.interface) {
		// deno-lint-ignore valid-typeof
		if (typeof wasmURI == FUNCTION_TYPE) {
			wasmURI = wasmURI();
		}
		let worker;
		try {
			worker = getWebWorker(workerData.workerURI, baseURI, workerData);
		} catch {
			webWorkerSupported = false;
			return createWorkerInterface(workerData, config);
		}
		Object.assign(workerData, {
			worker,
			terminated: false,
			interface: {
				run: () => runWebWorker(workerData, { chunkSize, wasmURI, baseURI })
			}
		});
	}
	return workerData.interface;
}

async function runWorker$1({ options, readable, writable, onTaskFinished }, config) {
	let codecStream;
	try {
		if (!options.useCompressionStream) {
			try {
				await initModule(config);
			} catch {
				const ZlibStream = options.codecType.startsWith(CODEC_DEFLATE) ?
					config.CompressionStreamZlib :
					config.DecompressionStreamZlib;
				if (!ZlibStream || ZlibStream.requiresModule) {
					options.useCompressionStream = true;
				}
			}
		}
		codecStream = new CodecStream(options, config);
		await readable.pipeThrough(codecStream).pipeTo(writable, { preventClose: true, preventAbort: true });
		const {
			signature,
			inputSize,
			outputSize
		} = codecStream;
		return {
			signature,
			inputSize,
			outputSize
		};
	} catch (error) {
		if (codecStream) {
			error.outputSize = codecStream.outputSize;
		}
		throw error;
	} finally {
		onTaskFinished();
	}
}

async function runWebWorker(workerData, config) {
	let resolveResult, rejectResult;
	const result = new Promise((resolve, reject) => {
		resolveResult = resolve;
		rejectResult = reject;
	});
	Object.assign(workerData, {
		reader: null,
		writer: null,
		resolveResult,
		rejectResult,
		result
	});
	const { readable, options } = workerData;
	const { writable, closed, abortPipe } = watchClosedStream(workerData.writable);
	let streamsTransferred;
	try {
		streamsTransferred = sendMessage({
			type: MESSAGE_START,
			options,
			config,
			readable,
			writable
		}, workerData);
	} catch (error) {
		abortPipe();
		try {
			await closed;
		} catch {
			// ignored
		}
		workerData.onTaskFinished();
		throw error;
	}
	if (!streamsTransferred) {
		Object.assign(workerData, {
			reader: readable.getReader(),
			writer: writable.getWriter()
		});
	}
	try {
		const resultValue = await result;
		await closeWritable();
		await closed;
		return resultValue;
	} catch (error) {
		await closeWritable();
		abortPipe();
		try {
			await closed;
		} catch {
			// ignored
		}
		throw error;
	}

	async function closeWritable() {
		if (!streamsTransferred && !writable.locked) {
			try {
				await writable.getWriter().close();
			} catch {
				// ignored
			}
		}
	}
}

function watchClosedStream(writableSource) {
	const abortController = new AbortController();
	const { writable, readable } = new TransformStream();
	const closed = readable.pipeTo(writableSource, { preventClose: true, preventAbort: true, signal: abortController.signal });
	closed.catch(() => { });
	return { writable, closed, abortPipe: () => abortController.abort() };
}

function terminateWorker$1(workerData) {
	const { worker } = workerData;
	if (worker) {
		try {
			worker.terminate();
		} catch {
			// ignored
		}
	}
	workerData.interface = null;
}

function getWebWorker(url, baseURI, workerData, isModuleType, useBlobURI = true) {
	let worker, resolvedURI, resolvedOptions;
	if (webWorkerURI === UNDEFINED_VALUE || webWorkerSource !== url) {
		// deno-lint-ignore valid-typeof
		const isFunctionURI = typeof url == FUNCTION_TYPE;
		if (isFunctionURI) {
			resolvedURI = url(useBlobURI);
		} else {
			resolvedURI = url;
		}
		const isDataURI = resolvedURI.startsWith("data:");
		const isBlobURI = resolvedURI.startsWith("blob:");
		if (isDataURI || isBlobURI) {
			if (isModuleType === UNDEFINED_VALUE) {
				isModuleType = false;
			}
			if (isModuleType) {
				resolvedOptions = MODULE_WORKER_OPTIONS;
			}
			try {
				worker = new Worker(resolvedURI, resolvedOptions);
			} catch (error) {
				if (isBlobURI) {
					try {
						URL.revokeObjectURL(resolvedURI);
					} catch {
						// ignored
					}
				}
				if (isFunctionURI && isBlobURI) {
					return getWebWorker(url, baseURI, workerData, isModuleType, false);
				} else if (!isModuleType) {
					return getWebWorker(url, baseURI, workerData, true, false);
				} else {
					throw error;
				}
			}
		} else {
			if (isModuleType === UNDEFINED_VALUE) {
				isModuleType = true;
			}
			if (isModuleType) {
				resolvedOptions = MODULE_WORKER_OPTIONS;
			}
			try {
				resolvedURI = new URL(resolvedURI, baseURI);
			} catch {
				// ignored
			}
			try {
				worker = new Worker(resolvedURI, resolvedOptions);
			} catch (error) {
				if (!isModuleType) {
					return getWebWorker(url, baseURI, workerData, false, useBlobURI);
				} else {
					throw error;
				}
			}
		}
		webWorkerSource = url;
		webWorkerURI = resolvedURI;
		webWorkerOptions = resolvedOptions;
	} else {
		worker = new Worker(webWorkerURI, webWorkerOptions);
	}
	worker.addEventListener(MESSAGE_EVENT_TYPE, event => onMessage(event, workerData));
	worker.addEventListener(ERROR_EVENT_TYPE, event => onWorkerError(event, workerData));
	worker.addEventListener(MESSAGE_ERROR_EVENT_TYPE, event => onWorkerError(event, workerData));
	return worker;
}

function onWorkerError(event, workerData) {
	if (event.preventDefault) {
		event.preventDefault();
	}
	const { rejectResult, writer, onTaskFinished } = workerData;
	terminateWorker$1(workerData);
	if (rejectResult) {
		rejectResult(event.error || new Error(event.message || ERROR_EVENT_TYPE));
		if (writer) {
			writer.releaseLock();
		}
		onTaskFinished();
	}
}

function sendMessage(message, { worker, writer, transferStreams }) {
	try {
		const { value, readable, writable } = message;
		const transferables = [];
		if (value) {
			message.value = value;
			transferables.push(message.value.buffer);
		}
		if (transferStreams && transferStreamsSupported) {
			if (readable) {
				transferables.push(readable);
			}
			if (writable) {
				transferables.push(writable);
			}
		} else {
			message.readable = message.writable = null;
		}
		if (transferables.length) {
			try {
				worker.postMessage(message, transferables);
				return true;
			} catch {
				transferStreamsSupported = false;
				message.readable = message.writable = null;
				worker.postMessage(message);
			}
		} else {
			worker.postMessage(message);
		}
	} catch (error) {
		if (writer) {
			writer.releaseLock();
		}
		throw error;
	}
}

async function onMessage({ data }, workerData) {
	const { type, value, messageId, result, error } = data;
	const { reader, writer, resolveResult, rejectResult, onTaskFinished, generation } = workerData;
	const stale = () => workerData.generation != generation;
	try {
		if (error) {
			const { message, stack, code, name, outputSize } = error;
			const responseError = new Error(message);
			Object.assign(responseError, { stack, code, name, outputSize });
			close(responseError);
		} else {
			if (type == MESSAGE_PULL) {
				const { value, done } = await reader.read();
				if (!stale()) {
					sendMessage({ type: MESSAGE_DATA, value, done, messageId }, workerData);
				}
			}
			if (type == MESSAGE_DATA) {
				await writer.ready;
				await writer.write(new Uint8Array(value));
				if (!stale()) {
					sendMessage({ type: MESSAGE_ACK_DATA, messageId }, workerData);
				}
			}
			if (type == MESSAGE_CLOSE) {
				close(null, result);
			}
		}
	} catch (error) {
		if (!stale()) {
			terminateWorker$1(workerData);
			close(error);
		}
	}

	function close(error, result) {
		if (stale()) {
			return;
		}
		if (error) {
			rejectResult(error);
		} else {
			resolveResult(result);
		}
		if (writer) {
			writer.releaseLock();
		}
		onTaskFinished();
	}
}

/*
 Copyright (c) 2025 Gildas Lormeau. All rights reserved.

 Redistribution and use in source and binary forms, with or without
 modification, are permitted provided that the following conditions are met:

 1. Redistributions of source code must retain the above copyright notice,
 this list of conditions and the following disclaimer.

 2. Redistributions in binary form must reproduce the above copyright 
 notice, this list of conditions and the following disclaimer in 
 the documentation and/or other materials provided with the distribution.

 3. The names of the authors may not be used to endorse or promote products
 derived from this software without specific prior written permission.

 THIS SOFTWARE IS PROVIDED ''AS IS'' AND ANY EXPRESSED OR IMPLIED WARRANTIES,
 INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND
 FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL JCRAFT,
 INC. OR ANY CONTRIBUTORS TO THIS SOFTWARE BE LIABLE FOR ANY DIRECT, INDIRECT,
 INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA,
 OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
 LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
 EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */


let pool = [];
const pendingRequests = [];
let starvationTimeout;
let starvationDelay;

let indexWorker = 0;

async function runWorker(stream, workerOptions) {
	const { options, config } = workerOptions;
	const { transferStreams, useWebWorkers, useCompressionStream, compressed, signed, encrypted } = options;
	const { workerURI, maxWorkers } = config;
	workerOptions.transferStreams = transferStreams || transferStreams === UNDEFINED_VALUE;
	const streamCopy = !compressed && !signed && !encrypted && !workerOptions.transferStreams;
	workerOptions.useWebWorkers = !streamCopy && (useWebWorkers || (useWebWorkers === UNDEFINED_VALUE && config.useWebWorkers));
	workerOptions.workerURI = workerOptions.useWebWorkers && workerURI ? workerURI : UNDEFINED_VALUE;
	options.useCompressionStream = useCompressionStream || (useCompressionStream === UNDEFINED_VALUE && config.useCompressionStream);
	return (await getWorker()).run();

	// deno-lint-ignore require-await
	async function getWorker() {
		const workerData = pool.find(workerData => !workerData.busy);
		if (workerData) {
			clearTerminateTimeout(workerData);
			return new CodecWorker(workerData, stream, workerOptions, onTaskFinished);
		} else if (pool.length < maxWorkers) {
			const workerData = { indexWorker };
			indexWorker++;
			pool.push(workerData);
			return new CodecWorker(workerData, stream, workerOptions, onTaskFinished);
		} else {
			return new Promise(resolve => {
				pendingRequests.push({ resolve, stream, workerOptions });
				starvationDelay = config.workerStarvationTimeout;
				armStarvationTimeout();
			});
		}
	}

	function onTaskFinished(workerData) {
		clearStarvationTimeout();
		if (pendingRequests.length) {
			const [{ resolve, stream, workerOptions }] = pendingRequests.splice(0, 1);
			resolve(new CodecWorker(workerData, stream, workerOptions, onTaskFinished));
			armStarvationTimeout();
		} else if (workerData.worker) {
			clearTerminateTimeout(workerData);
			terminateWorker(workerData, workerOptions);
		} else {
			pool = pool.filter(data => data != workerData);
		}
	}
}

function armStarvationTimeout() {
	if (!starvationTimeout && pendingRequests.length && Number.isFinite(starvationDelay) && starvationDelay >= 0) {
		starvationTimeout = setTimeout(onWorkerStarvation, starvationDelay);
	}
}

function clearStarvationTimeout() {
	if (starvationTimeout) {
		clearTimeout(starvationTimeout);
		starvationTimeout = null;
	}
}

function onWorkerStarvation() {
	starvationTimeout = null;
	if (pendingRequests.length) {
		const [{ resolve, stream, workerOptions }] = pendingRequests.splice(0, 1);
		const inlineWorkerOptions = Object.assign({}, workerOptions, { useWebWorkers: false, workerURI: UNDEFINED_VALUE });
		resolve(new CodecWorker({}, stream, inlineWorkerOptions, onInlineTaskFinished));
		armStarvationTimeout();
	}
}

function onInlineTaskFinished() {
	clearStarvationTimeout();
	armStarvationTimeout();
}

function terminateWorker(workerData, workerOptions) {
	const { config } = workerOptions;
	const { terminateWorkerTimeout } = config;
	if (Number.isFinite(terminateWorkerTimeout) && terminateWorkerTimeout >= 0) {
		if (workerData.terminated) {
			workerData.terminated = false;
		} else {
			workerData.terminateTimeout = setTimeout(async () => {
				pool = pool.filter(data => data != workerData);
				try {
					await workerData.terminate();
				} catch {
					// ignored
				}
			}, terminateWorkerTimeout);
		}
	}
}

function clearTerminateTimeout(workerData) {
	const { terminateTimeout } = workerData;
	if (terminateTimeout) {
		clearTimeout(terminateTimeout);
		workerData.terminateTimeout = null;
	}
}

async function terminateWorkers() {
	await Promise.allSettled(pool.map(workerData => {
		clearTerminateTimeout(workerData);
		return workerData.terminate();
	}));
}

/*
 Copyright (c) 2025 Gildas Lormeau. All rights reserved.

 Redistribution and use in source and binary forms, with or without
 modification, are permitted provided that the following conditions are met:

 1. Redistributions of source code must retain the above copyright notice,
 this list of conditions and the following disclaimer.

 2. Redistributions in binary form must reproduce the above copyright 
 notice, this list of conditions and the following disclaimer in 
 the documentation and/or other materials provided with the distribution.

 3. The names of the authors may not be used to endorse or promote products
 derived from this software without specific prior written permission.

 THIS SOFTWARE IS PROVIDED ''AS IS'' AND ANY EXPRESSED OR IMPLIED WARRANTIES,
 INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND
 FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL JCRAFT,
 INC. OR ANY CONTRIBUTORS TO THIS SOFTWARE BE LIABLE FOR ANY DIRECT, INDIRECT,
 INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA,
 OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
 LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
 EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */


const ERR_HTTP_STATUS = "HTTP error ";
const ERR_HTTP_RANGE = "HTTP Range not supported";
const ERR_ITERATOR_COMPLETED_TOO_SOON = "Writer iterator completed too soon";
const ERR_WRITER_NOT_INITIALIZED = "Writer not initialized";

const CONTENT_TYPE_TEXT_PLAIN = "text/plain";
const HTTP_HEADER_CONTENT_LENGTH = "Content-Length";
const HTTP_HEADER_CONTENT_ENCODING = "Content-Encoding";
const HTTP_HEADER_CONTENT_RANGE = "Content-Range";
const HTTP_HEADER_ACCEPT_RANGES = "Accept-Ranges";
const HTTP_HEADER_RANGE = "Range";
const HTTP_HEADER_CONTENT_TYPE = "Content-Type";
const HTTP_METHOD_HEAD = "HEAD";
const HTTP_METHOD_GET = "GET";
const HTTP_RANGE_UNIT = "bytes";
const DEFAULT_CHUNK_SIZE = 64 * 1024;
const DEFAULT_BUFFER_SIZE = 256 * 1024;

const PROPERTY_NAME_WRITABLE = "writable";

class Stream {

	constructor() {
		this.size = 0;
	}

	init() {
		this.initialized = true;
	}
}

class Reader extends Stream {

	get readable() {
		return this.createReadable();
	}

	createReadable({ offset = 0, size, diskNumberStart, chunkSize = DEFAULT_CHUNK_SIZE } = {}) {
		const reader = this;
		let chunkOffset = 0;
		return new ReadableStream({
			async pull(controller) {
				const dataSize = size === UNDEFINED_VALUE ? chunkSize : Math.min(chunkSize, size - chunkOffset);
				const data = await readUint8Array(reader, offset + chunkOffset, dataSize, diskNumberStart);
				controller.enqueue(data);
				if ((chunkOffset + chunkSize > size) || (size === UNDEFINED_VALUE && !data.length && dataSize)) {
					controller.close();
				} else {
					chunkOffset += chunkSize;
				}
			}
		});
	}
}

class Writer extends Stream {

	constructor() {
		super();
		const writer = this;
		const writable = new WritableStream({
			write(chunk) {
				if (!writer.initialized) {
					throw new Error(ERR_WRITER_NOT_INITIALIZED);
				}
				return writer.writeUint8Array(chunk);
			}
		});
		Object.defineProperty(writer, PROPERTY_NAME_WRITABLE, {
			get() {
				return writable;
			}
		});
	}

	writeUint8Array() {
		// abstract
	}
}

class Data64URIReader extends Reader {

	constructor(dataURI) {
		super();
		let dataEnd = dataURI.length;
		while (dataURI.charAt(dataEnd - 1) == "=") {
			dataEnd--;
		}
		const dataStart = dataURI.indexOf(",") + 1;
		Object.assign(this, {
			dataURI,
			dataStart,
			size: Math.floor((dataEnd - dataStart) * 0.75)
		});
	}

	readUint8Array(offset, length) {
		const {
			dataStart,
			dataURI
		} = this;
		const dataArray = new Uint8Array(length);
		const start = Math.floor(offset / 3) * 4;
		const bytes = atob(dataURI.substring(start + dataStart, Math.ceil((offset + length) / 3) * 4 + dataStart));
		const delta = offset - Math.floor(start / 4) * 3;
		let effectiveLength = 0;
		for (let indexByte = delta; indexByte < delta + length && indexByte < bytes.length; indexByte++) {
			dataArray[indexByte - delta] = bytes.charCodeAt(indexByte);
			effectiveLength++;
		}
		if (effectiveLength < dataArray.length) {
			return dataArray.subarray(0, effectiveLength);
		} else {
			return dataArray;
		}
	}
}

class Data64URIWriter extends Writer {

	constructor(contentType) {
		super();
		Object.assign(this, {
			data: "data:" + (contentType || "") + ";base64,",
			pending: []
		});
	}

	writeUint8Array(array) {
		const writer = this;
		let indexArray;
		let dataString = writer.pending;
		const delta = writer.pending.length;
		writer.pending = "";
		for (indexArray = 0; indexArray < (Math.floor((delta + array.length) / 3) * 3) - delta; indexArray++) {
			dataString += String.fromCharCode(array[indexArray]);
		}
		for (; indexArray < array.length; indexArray++) {
			writer.pending += String.fromCharCode(array[indexArray]);
		}
		if (dataString.length > 2) {
			writer.data += btoa(dataString);
		} else {
			writer.pending = dataString + writer.pending;
		}
	}

	getData() {
		return this.data + btoa(this.pending);
	}
}

class BlobReader extends Reader {

	constructor(blob) {
		super();
		Object.assign(this, {
			blob,
			size: blob.size
		});
	}

	async readUint8Array(offset, length) {
		const reader = this;
		const offsetEnd = offset + length;
		const blob = offset || offsetEnd < reader.size ? reader.blob.slice(offset, offsetEnd) : reader.blob;
		let arrayBuffer = await blob.arrayBuffer();
		if (arrayBuffer.byteLength > length) {
			arrayBuffer = arrayBuffer.slice(offset, offsetEnd);
		}
		return new Uint8Array(arrayBuffer);
	}
}

class BlobWriter extends Stream {

	constructor(contentType) {
		super();
		const writer = this;
		const transformStream = new TransformStream();
		const headers = [];
		if (contentType) {
			headers.push([HTTP_HEADER_CONTENT_TYPE, contentType]);
		}
		Object.defineProperty(writer, PROPERTY_NAME_WRITABLE, {
			get() {
				return transformStream.writable;
			}
		});
		writer.blob = new Response(transformStream.readable, { headers }).blob();
		writer.blob.catch(() => { });
	}

	getData() {
		return this.blob;
	}
}

class TextReader extends BlobReader {

	constructor(text) {
		super(new Blob([text], { type: CONTENT_TYPE_TEXT_PLAIN }));
	}
}

class TextWriter extends BlobWriter {

	constructor(encoding) {
		super(encoding);
		Object.assign(this, {
			encoding,
			utf8: !encoding || encoding.toLowerCase() == "utf-8"
		});
	}

	async getData() {
		const {
			encoding,
			utf8
		} = this;
		const blob = await super.getData();
		if (blob.text && utf8) {
			return blob.text();
		} else {
			const reader = new FileReader();
			return new Promise((resolve, reject) => {
				Object.assign(reader, {
					onload: ({ target }) => resolve(target.result),
					onerror: () => reject(reader.error)
				});
				reader.readAsText(blob, encoding);
			});
		}
	}
}

class FetchReader extends Reader {

	constructor(url, options) {
		super();
		createHttpReader(this, url, options);
	}

	async init() {
		await initHttpReader(this, sendFetchRequest, getFetchRequestData);
		super.init();
	}

	readUint8Array(index, length) {
		return readUint8ArrayHttpReader(this, index, length, sendFetchRequest, getFetchRequestData);
	}
}

class XHRReader extends Reader {

	constructor(url, options) {
		super();
		createHttpReader(this, url, options);
	}

	async init() {
		await initHttpReader(this, sendXMLHttpRequest, getXMLHttpRequestData);
		super.init();
	}

	readUint8Array(index, length) {
		return readUint8ArrayHttpReader(this, index, length, sendXMLHttpRequest, getXMLHttpRequestData);
	}
}

function createHttpReader(httpReader, url, options) {
	const {
		preventHeadRequest,
		useRangeHeader,
		forceRangeRequests,
		combineSizeEocd,
		fetch
	} = options;
	options = Object.assign({}, options);
	delete options.preventHeadRequest;
	delete options.useRangeHeader;
	delete options.forceRangeRequests;
	delete options.combineSizeEocd;
	delete options.useXHR;
	delete options.fetch;
	Object.assign(httpReader, {
		url,
		options,
		preventHeadRequest,
		useRangeHeader,
		forceRangeRequests,
		combineSizeEocd,
		fetch
	});
}

async function initHttpReader(httpReader, sendRequest, getRequestData) {
	const {
		url,
		preventHeadRequest,
		useRangeHeader,
		forceRangeRequests,
		combineSizeEocd
	} = httpReader;
	if (isHttpFamily(url) && (useRangeHeader || forceRangeRequests) && (typeof preventHeadRequest == "undefined" || preventHeadRequest)) {
		const response = await sendRequest(HTTP_METHOD_GET, httpReader, getRangeHeaders(httpReader, combineSizeEocd ? -END_OF_CENTRAL_DIR_LENGTH : undefined));
		const acceptRanges = response.headers.get(HTTP_HEADER_ACCEPT_RANGES);
		if (!forceRangeRequests && (!acceptRanges || acceptRanges.toLowerCase() != HTTP_RANGE_UNIT)) {
			throw new Error(ERR_HTTP_RANGE);
		} else {
			if (combineSizeEocd) {
				const eocdCache = new Uint8Array(await response.arrayBuffer());
				if (response.status == 206 && eocdCache.length == END_OF_CENTRAL_DIR_LENGTH) {
					httpReader.eocdCache = eocdCache;
				}
			}
			let contentSize;
			const contentRangeHeader = response.headers.get(HTTP_HEADER_CONTENT_RANGE);
			if (contentRangeHeader) {
				const splitHeader = contentRangeHeader.trim().split(/\s*\/\s*/);
				if (splitHeader.length) {
					const headerValue = splitHeader[1];
					if (headerValue && headerValue != "*") {
						contentSize = Number(headerValue);
					}
				}
			}
			if (contentSize === UNDEFINED_VALUE) {
				await getContentLength(httpReader, sendRequest, getRequestData);
			} else {
				httpReader.size = contentSize;
			}
		}
	} else {
		await getContentLength(httpReader, sendRequest, getRequestData);
	}
}

async function readUint8ArrayHttpReader(httpReader, index, length, sendRequest, getRequestData) {
	const {
		useRangeHeader,
		forceRangeRequests,
		eocdCache,
		size,
		options
	} = httpReader;
	if (useRangeHeader || forceRangeRequests) {
		if (eocdCache && index == size - END_OF_CENTRAL_DIR_LENGTH && length == END_OF_CENTRAL_DIR_LENGTH) {
			return eocdCache;
		}
		if (index >= size || length === 0) {
			return EMPTY_UINT8_ARRAY;
		} else {
			if (index + length > size) {
				length = size - index;
			}
			const response = await sendRequest(HTTP_METHOD_GET, httpReader, getRangeHeaders(httpReader, index, length));
			if (response.status != 206) {
				throw new Error(ERR_HTTP_RANGE);
			}
			const contentRangeHeader = response.headers.get(HTTP_HEADER_CONTENT_RANGE);
			if (contentRangeHeader) {
				const rangeStart = Number(contentRangeHeader.trim().split(/[\s-]+/)[1]);
				if (!Number.isNaN(rangeStart) && rangeStart != index) {
					throw new Error(ERR_HTTP_RANGE);
				}
			}
			const data = new Uint8Array(await response.arrayBuffer());
			if (data.length != length) {
				throw new Error(ERR_HTTP_RANGE);
			}
			return data;
		}
	} else {
		const { data } = httpReader;
		if (!data) {
			await getRequestData(httpReader, options);
		}
		return new Uint8Array(httpReader.data.subarray(index, index + length));
	}
}

function getRangeHeaders(httpReader, index = 0, length = 1) {
	return Object.assign({}, getHeaders(httpReader), { [HTTP_HEADER_RANGE]: HTTP_RANGE_UNIT + "=" + (index < 0 ? index : index + "-" + (index + length - 1)) });
}

function getHeaders({ options }) {
	const { headers } = options;
	if (headers) {
		if (Symbol.iterator in headers) {
			return Object.fromEntries(headers);
		} else {
			return headers;
		}
	}
}

async function getFetchRequestData(httpReader) {
	await getRequestData(httpReader, sendFetchRequest);
}

async function getXMLHttpRequestData(httpReader) {
	await getRequestData(httpReader, sendXMLHttpRequest);
}

async function getRequestData(httpReader, sendRequest) {
	const response = await sendRequest(HTTP_METHOD_GET, httpReader, getHeaders(httpReader));
	httpReader.data = new Uint8Array(await response.arrayBuffer());
	httpReader.size = httpReader.data.length;
}

async function getContentLength(httpReader, sendRequest, getRequestData) {
	if (httpReader.preventHeadRequest) {
		await getRequestData(httpReader, httpReader.options);
	} else {
		const response = await sendRequest(HTTP_METHOD_HEAD, httpReader, getHeaders(httpReader));
		const contentLength = response.headers.get(HTTP_HEADER_CONTENT_LENGTH);
		if (contentLength && !response.headers.get(HTTP_HEADER_CONTENT_ENCODING)) {
			httpReader.size = Number(contentLength);
		} else {
			await getRequestData(httpReader, httpReader.options);
		}
	}
}

async function sendFetchRequest(method, { fetch: fetchFunction = fetch, options, url }, headers) {
	const response = await fetchFunction(url, Object.assign({}, options, { method, headers }));
	if (response.status < 400) {
		return response;
	} else {
		throw response.status == 416 ? new Error(ERR_HTTP_RANGE) : new Error(ERR_HTTP_STATUS + (response.statusText || response.status));
	}
}

function sendXMLHttpRequest(method, { url }, headers) {
	return new Promise((resolve, reject) => {
		const request = new XMLHttpRequest();
		request.addEventListener("load", () => {
			if (request.status < 400) {
				const headers = [];
				request.getAllResponseHeaders().trim().split(/[\r\n]+/).forEach(header => {
					const splitHeader = header.trim().split(/\s*:\s*/);
					splitHeader[0] = splitHeader[0].trim().replace(/^[a-z]|-[a-z]/g, value => value.toUpperCase());
					headers.push(splitHeader);
				});
				resolve({
					status: request.status,
					arrayBuffer: () => request.response,
					headers: new Map(headers)
				});
			} else {
				reject(request.status == 416 ? new Error(ERR_HTTP_RANGE) : new Error(ERR_HTTP_STATUS + (request.statusText || request.status)));
			}
		}, false);
		request.addEventListener("error", event => reject(event.detail ? event.detail.error : new Error("Network error")), false);
		request.open(method, url);
		if (headers) {
			for (const entry of Object.entries(headers)) {
				request.setRequestHeader(entry[0], entry[1]);
			}
		}
		request.responseType = "arraybuffer";
		request.send();
	});
}

class HttpReader extends Reader {

	constructor(url, options = {}) {
		super();
		Object.assign(this, {
			url,
			reader: options.useXHR && !options.fetch ? new XHRReader(url, options) : new FetchReader(url, options)
		});
	}

	set size(value) {
		// ignored
	}

	get size() {
		return this.reader.size;
	}

	async init() {
		await this.reader.init();
		super.init();
	}

	readUint8Array(index, length) {
		return this.reader.readUint8Array(index, length);
	}
}

class HttpRangeReader extends HttpReader {

	constructor(url, options = {}) {
		super(url, Object.assign({}, options, { useRangeHeader: true }));
	}
}


class Uint8ArrayReader extends Reader {

	constructor(array) {
		super();
		array = new Uint8Array(array.buffer, array.byteOffset, array.byteLength);
		Object.assign(this, {
			array,
			size: array.length
		});
	}

	readUint8Array(index, length) {
		return this.array.slice(index, index + length);
	}
}

class Uint8ArrayWriter extends Writer {

	constructor(defaultBufferSize) {
		super();
		this.defaultBufferSize = defaultBufferSize || DEFAULT_BUFFER_SIZE;
	}

	init(initSize = 0) {
		Object.assign(this, {
			offset: 0,
			array: new Uint8Array(initSize > 0 ? initSize : this.defaultBufferSize)
		});
		super.init();
	}

	writeUint8Array(array) {
		const writer = this;
		const requiredLength = writer.offset + array.length;
		if (requiredLength > writer.array.length) {
			let newLength = writer.array.length ? writer.array.length * 2 : writer.defaultBufferSize;
			while (newLength < requiredLength) {
				newLength *= 2;
			}
			const previousArray = writer.array;
			writer.array = new Uint8Array(newLength);
			writer.array.set(previousArray);
		}
		writer.array.set(array, writer.offset);
		writer.offset += array.length;
	}

	getData() {
		if (this.offset === this.array.length) {
			return this.array;
		} else {
			return this.array.slice(0, this.offset);
		}
	}
}

class SplitDataReader extends Reader {

	constructor(readers) {
		super();
		this.readers = readers;
	}

	async init() {
		const reader = this;
		const { readers } = reader;
		reader.lastDiskNumber = 0;
		reader.lastDiskOffset = 0;
		await Promise.all(readers.map(async (diskReader, indexDiskReader) => {
			await initStream(diskReader);
			if (indexDiskReader != readers.length - 1) {
				reader.lastDiskOffset += diskReader.size;
			}
			reader.size += diskReader.size;
		}));
		super.init();
	}

	async readUint8Array(offset, length, diskNumber = 0) {
		const reader = this;
		const { readers } = this;
		let result;
		let currentDiskNumber = diskNumber;
		if (currentDiskNumber == -1) {
			currentDiskNumber = readers.length - 1;
		}
		let currentReaderOffset = offset;
		while (readers[currentDiskNumber] && currentReaderOffset >= readers[currentDiskNumber].size) {
			currentReaderOffset -= readers[currentDiskNumber].size;
			currentDiskNumber++;
		}
		const currentReader = readers[currentDiskNumber];
		if (currentReader) {
			const currentReaderSize = currentReader.size;
			if (currentReaderOffset + length <= currentReaderSize) {
				result = await readUint8Array(currentReader, currentReaderOffset, length);
			} else {
				const chunkLength = currentReaderSize - currentReaderOffset;
				result = new Uint8Array(length);
				const firstPart = await readUint8Array(currentReader, currentReaderOffset, chunkLength);
				result.set(firstPart, 0);
				const secondPart = await reader.readUint8Array(offset + chunkLength, length - chunkLength, diskNumber);
				result.set(secondPart, chunkLength);
				if (firstPart.length + secondPart.length < length) {
					result = result.subarray(0, firstPart.length + secondPart.length);
				}
			}
		} else {
			result = EMPTY_UINT8_ARRAY;
		}
		reader.lastDiskNumber = Math.max(currentDiskNumber, reader.lastDiskNumber);
		return result;
	}
}

class SplitDataWriter extends Stream {

	constructor(writerGenerator, maxSize = 4294967295) {
		super();
		const writer = this;
		Object.assign(writer, {
			diskNumber: 0,
			diskOffset: 0,
			size: 0,
			maxSize,
			availableSize: maxSize
		});
		let diskSourceWriter, diskWritable, diskWriter;
		const writable = new WritableStream({
			async write(chunk) {
				const { availableSize } = writer;
				if (!diskWriter) {
					const { value, done } = await writerGenerator.next();
					if (done && !value) {
						throw new Error(ERR_ITERATOR_COMPLETED_TOO_SOON);
					} else {
						diskSourceWriter = value;
						diskSourceWriter.size = 0;
						if (diskSourceWriter.maxSize) {
							writer.maxSize = diskSourceWriter.maxSize;
						}
						writer.availableSize = writer.maxSize;
						await initStream(diskSourceWriter);
						diskWritable = value.writable;
						diskWriter = diskWritable.getWriter();
					}
					await this.write(chunk);
				} else if (chunk.length >= availableSize) {
					await writeChunk(chunk.subarray(0, availableSize));
					await closeDisk();
					writer.diskOffset += diskSourceWriter.size;
					writer.diskNumber++;
					diskWriter = null;
					writer.availableSize = writer.maxSize;
					if (chunk.length > availableSize) {
						await this.write(chunk.subarray(availableSize));
					}
				} else {
					await writeChunk(chunk);
				}
			},
			async close() {
				if (diskWriter) {
					await diskWriter.ready;
					await closeDisk();
				}
			},
			async abort(reason) {
				if (diskWriter) {
					await diskWriter.abort(reason);
				}
			}
		});
		Object.defineProperty(writer, PROPERTY_NAME_WRITABLE, {
			get() {
				return writable;
			}
		});

		async function writeChunk(chunk) {
			const chunkLength = chunk.length;
			if (chunkLength) {
				await diskWriter.ready;
				await diskWriter.write(chunk);
				diskSourceWriter.size += chunkLength;
				writer.availableSize -= chunkLength;
			}
		}

		async function closeDisk() {
			await diskWriter.close();
		}
	}
}

class GenericReader {

	constructor(reader) {
		if (Array.isArray(reader)) {
			reader = new SplitDataReader(reader);
		}
		if (reader instanceof ReadableStream) {
			reader = {
				readable: reader
			};
		}
		return reader;
	}
}

class GenericWriter {

	constructor(writer) {
		if (writer.writable === UNDEFINED_VALUE && typeof writer.next == FUNCTION_TYPE) {
			writer = new SplitDataWriter(writer);
		}
		if (writer instanceof WritableStream) {
			writer = {
				writable: writer
			};
		}
		if (writer.size === UNDEFINED_VALUE) {
			writer.size = 0;
		}
		if (!(writer instanceof SplitDataWriter)) {
			Object.assign(writer, {
				diskNumber: 0,
				diskOffset: 0,
				availableSize: INFINITY_VALUE,
				maxSize: INFINITY_VALUE
			});
		}
		return writer;
	}
}

function isHttpFamily(url) {
	const { baseURI } = getConfiguration();
	const { protocol } = new URL(url, baseURI);
	return protocol == "http:" || protocol == "https:";
}

async function initStream(stream, initSize) {
	if (stream.init && !stream.initialized) {
		await stream.init(initSize);
	} else {
		return Promise.resolve();
	}
}

function readUint8Array(reader, offset, size, diskNumber) {
	return reader.readUint8Array(offset, size, diskNumber);
}

/*
 Copyright (c) 2022 Gildas Lormeau. All rights reserved.

 Redistribution and use in source and binary forms, with or without
 modification, are permitted provided that the following conditions are met:

 1. Redistributions of source code must retain the above copyright notice,
 this list of conditions and the following disclaimer.

 2. Redistributions in binary form must reproduce the above copyright 
 notice, this list of conditions and the following disclaimer in 
 the documentation and/or other materials provided with the distribution.

 3. The names of the authors may not be used to endorse or promote products
 derived from this software without specific prior written permission.

 THIS SOFTWARE IS PROVIDED ''AS IS'' AND ANY EXPRESSED OR IMPLIED WARRANTIES,
 INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND
 FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL JCRAFT,
 INC. OR ANY CONTRIBUTORS TO THIS SOFTWARE BE LIABLE FOR ANY DIRECT, INDIRECT,
 INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA,
 OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
 LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
 EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

/* global TextDecoder */

const CP437 = "\0☺☻♥♦♣♠•◘○◙♂♀♪♫☼►◄↕‼¶§▬↨↑↓→←∟↔▲▼ !\"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~⌂ÇüéâäàåçêëèïîìÄÅÉæÆôöòûùÿÖÜ¢£¥₧ƒáíóúñÑªº¿⌐¬½¼¡«»░▒▓│┤╡╢╖╕╣║╗╝╜╛┐└┴┬├─┼╞╟╚╔╩╦╠═╬╧╨╤╥╙╘╒╓╫╪┘┌█▄▌▐▀αßΓπΣσµτΦΘΩδ∞φε∩≡±≥≤⌠⌡÷≈°∙·√ⁿ²■ ".split("");
const VALID_CP437 = CP437.length == 256;

function decodeCP437(stringValue) {
	if (VALID_CP437) {
		let result = "";
		for (let indexCharacter = 0; indexCharacter < stringValue.length; indexCharacter++) {
			result += CP437[stringValue[indexCharacter]];
		}
		return result;
	} else {
		return new TextDecoder().decode(stringValue);
	}
}

/*
 Copyright (c) 2022 Gildas Lormeau. All rights reserved.

 Redistribution and use in source and binary forms, with or without
 modification, are permitted provided that the following conditions are met:

 1. Redistributions of source code must retain the above copyright notice,
 this list of conditions and the following disclaimer.

 2. Redistributions in binary form must reproduce the above copyright 
 notice, this list of conditions and the following disclaimer in 
 the documentation and/or other materials provided with the distribution.

 3. The names of the authors may not be used to endorse or promote products
 derived from this software without specific prior written permission.

 THIS SOFTWARE IS PROVIDED ''AS IS'' AND ANY EXPRESSED OR IMPLIED WARRANTIES,
 INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND
 FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL JCRAFT,
 INC. OR ANY CONTRIBUTORS TO THIS SOFTWARE BE LIABLE FOR ANY DIRECT, INDIRECT,
 INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA,
 OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
 LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
 EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */


function decodeText(value, encoding) {
	if (encoding && encoding.trim().toLowerCase() == "cp437") {
		return decodeCP437(value);
	} else {
		return new TextDecoder(encoding, { ignoreBOM: true }).decode(value);
	}
}

/*
 Copyright (c) 2025 Gildas Lormeau. All rights reserved.

 Redistribution and use in source and binary forms, with or without
 modification, are permitted provided that the following conditions are met:

 1. Redistributions of source code must retain the above copyright notice,
 this list of conditions and the following disclaimer.

 2. Redistributions in binary form must reproduce the above copyright 
 notice, this list of conditions and the following disclaimer in 
 the documentation and/or other materials provided with the distribution.

 3. The names of the authors may not be used to endorse or promote products
 derived from this software without specific prior written permission.

 THIS SOFTWARE IS PROVIDED ''AS IS'' AND ANY EXPRESSED OR IMPLIED WARRANTIES,
 INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND
 FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL JCRAFT,
 INC. OR ANY CONTRIBUTORS TO THIS SOFTWARE BE LIABLE FOR ANY DIRECT, INDIRECT,
 INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA,
 OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
 LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
 EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

const PROPERTY_NAME_FILENAME = "filename";
const PROPERTY_NAME_RAW_FILENAME = "rawFilename";
const PROPERTY_NAME_COMMENT = "comment";
const PROPERTY_NAME_RAW_COMMENT = "rawComment";
const PROPERTY_NAME_UNCOMPRESSED_SIZE = "uncompressedSize";
const PROPERTY_NAME_COMPRESSED_SIZE = "compressedSize";
const PROPERTY_NAME_OFFSET = "offset";
const PROPERTY_NAME_DISK_NUMBER_START = "diskNumberStart";
const PROPERTY_NAME_LAST_MODIFICATION_DATE = "lastModDate";
const PROPERTY_NAME_RAW_LAST_MODIFICATION_DATE = "rawLastModDate";
const PROPERTY_NAME_LAST_ACCESS_DATE = "lastAccessDate";
const PROPERTY_NAME_RAW_LAST_ACCESS_DATE = "rawLastAccessDate";
const PROPERTY_NAME_CREATION_DATE = "creationDate";
const PROPERTY_NAME_RAW_CREATION_DATE = "rawCreationDate";
const PROPERTY_NAME_INTERNAL_FILE_ATTRIBUTES = "internalFileAttributes";
const PROPERTY_NAME_EXTERNAL_FILE_ATTRIBUTES = "externalFileAttributes";
const PROPERTY_NAME_MSDOS_ATTRIBUTES_RAW = "msdosAttributesRaw";
const PROPERTY_NAME_MSDOS_ATTRIBUTES = "msdosAttributes";
const PROPERTY_NAME_MS_DOS_COMPATIBLE = "msDosCompatible";
const PROPERTY_NAME_ZIP64 = "zip64";
const PROPERTY_NAME_ENCRYPTED = "encrypted";
const PROPERTY_NAME_VERSION = "version";
const PROPERTY_NAME_VERSION_MADE_BY = "versionMadeBy";
const PROPERTY_NAME_ZIPCRYPTO = "zipCrypto";
const PROPERTY_NAME_DIRECTORY = "directory";
const PROPERTY_NAME_EXECUTABLE = "executable";
const PROPERTY_NAME_COMPRESSION_METHOD = "compressionMethod";
const PROPERTY_NAME_SIGNATURE = "signature";
const PROPERTY_NAME_EXTRA_FIELD = "extraField";
const PROPERTY_NAME_EXTRA_FIELD_INFOZIP = "extraFieldInfoZip";
const PROPERTY_NAME_EXTRA_FIELD_UNIX = "extraFieldUnix";
const PROPERTY_NAME_UID = "uid";
const PROPERTY_NAME_GID = "gid";
const PROPERTY_NAME_UNIX_MODE = "unixMode";
const PROPERTY_NAME_SETUID = "setuid";
const PROPERTY_NAME_SETGID = "setgid";
const PROPERTY_NAME_STICKY = "sticky";
const PROPERTY_NAME_BITFLAG = "bitFlag";
const PROPERTY_NAME_FILENAME_UTF8 = "filenameUTF8";
const PROPERTY_NAME_COMMENT_UTF8 = "commentUTF8";
const PROPERTY_NAME_RAW_EXTRA_FIELD = "rawExtraField";
const PROPERTY_NAME_EXTRA_FIELD_ZIP64 = "extraFieldZip64";
const PROPERTY_NAME_EXTRA_FIELD_UNICODE_PATH = "extraFieldUnicodePath";
const PROPERTY_NAME_EXTRA_FIELD_UNICODE_COMMENT = "extraFieldUnicodeComment";
const PROPERTY_NAME_EXTRA_FIELD_AES = "extraFieldAES";
const PROPERTY_NAME_EXTRA_FIELD_NTFS = "extraFieldNTFS";
const PROPERTY_NAME_EXTRA_FIELD_EXTENDED_TIMESTAMP = "extraFieldExtendedTimestamp";

const PROPERTY_NAMES = [
	PROPERTY_NAME_FILENAME,
	PROPERTY_NAME_RAW_FILENAME,
	PROPERTY_NAME_UNCOMPRESSED_SIZE,
	PROPERTY_NAME_COMPRESSED_SIZE,
	PROPERTY_NAME_LAST_MODIFICATION_DATE,
	PROPERTY_NAME_RAW_LAST_MODIFICATION_DATE,
	PROPERTY_NAME_COMMENT,
	PROPERTY_NAME_RAW_COMMENT,
	PROPERTY_NAME_LAST_ACCESS_DATE,
	PROPERTY_NAME_CREATION_DATE,
	PROPERTY_NAME_RAW_CREATION_DATE,
	PROPERTY_NAME_OFFSET,
	PROPERTY_NAME_DISK_NUMBER_START,
	PROPERTY_NAME_INTERNAL_FILE_ATTRIBUTES,
	PROPERTY_NAME_EXTERNAL_FILE_ATTRIBUTES,
	PROPERTY_NAME_MSDOS_ATTRIBUTES_RAW,
	PROPERTY_NAME_MSDOS_ATTRIBUTES,
	PROPERTY_NAME_MS_DOS_COMPATIBLE,
	PROPERTY_NAME_ZIP64,
	PROPERTY_NAME_ENCRYPTED,
	PROPERTY_NAME_VERSION,
	PROPERTY_NAME_VERSION_MADE_BY,
	PROPERTY_NAME_ZIPCRYPTO,
	PROPERTY_NAME_DIRECTORY,
	PROPERTY_NAME_EXECUTABLE,
	PROPERTY_NAME_COMPRESSION_METHOD,
	PROPERTY_NAME_SIGNATURE,
	PROPERTY_NAME_EXTRA_FIELD,
	PROPERTY_NAME_EXTRA_FIELD_UNIX,
	PROPERTY_NAME_EXTRA_FIELD_INFOZIP,
	PROPERTY_NAME_UID,
	PROPERTY_NAME_GID,
	PROPERTY_NAME_UNIX_MODE,
	PROPERTY_NAME_SETUID,
	PROPERTY_NAME_SETGID,
	PROPERTY_NAME_STICKY,
	PROPERTY_NAME_BITFLAG,
	PROPERTY_NAME_FILENAME_UTF8,
	PROPERTY_NAME_COMMENT_UTF8,
	PROPERTY_NAME_RAW_EXTRA_FIELD,
	PROPERTY_NAME_EXTRA_FIELD_ZIP64,
	PROPERTY_NAME_EXTRA_FIELD_UNICODE_PATH,
	PROPERTY_NAME_EXTRA_FIELD_UNICODE_COMMENT,
	PROPERTY_NAME_EXTRA_FIELD_AES,
	PROPERTY_NAME_EXTRA_FIELD_NTFS,
	PROPERTY_NAME_EXTRA_FIELD_EXTENDED_TIMESTAMP
];

class Entry {

	constructor(data) {
		PROPERTY_NAMES.forEach(name => this[name] = data[name]);
	}

}

/*
 Copyright (c) 2022 Gildas Lormeau. All rights reserved.

 Redistribution and use in source and binary forms, with or without
 modification, are permitted provided that the following conditions are met:

 1. Redistributions of source code must retain the above copyright notice,
 this list of conditions and the following disclaimer.

 2. Redistributions in binary form must reproduce the above copyright 
 notice, this list of conditions and the following disclaimer in 
 the documentation and/or other materials provided with the distribution.

 3. The names of the authors may not be used to endorse or promote products
 derived from this software without specific prior written permission.

 THIS SOFTWARE IS PROVIDED ''AS IS'' AND ANY EXPRESSED OR IMPLIED WARRANTIES,
 INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND
 FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL JCRAFT,
 INC. OR ANY CONTRIBUTORS TO THIS SOFTWARE BE LIABLE FOR ANY DIRECT, INDIRECT,
 INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA,
 OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
 LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
 EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

const OPTION_FILENAME_ENCODING = "filenameEncoding";
const OPTION_COMMENT_ENCODING = "commentEncoding";
const OPTION_DECODE_TEXT = "decodeText";
const OPTION_EXTRACT_PREPENDED_DATA = "extractPrependedData";
const OPTION_EXTRACT_APPENDED_DATA = "extractAppendedData";
const OPTION_PASSWORD = "password";
const OPTION_RAW_PASSWORD = "rawPassword";
const OPTION_PASS_THROUGH = "passThrough";
const OPTION_SIGNAL = "signal";
const OPTION_CHECK_PASSWORD_ONLY = "checkPasswordOnly";
const OPTION_CHECK_OVERLAPPING_ENTRY_ONLY = "checkOverlappingEntryOnly";
const OPTION_CHECK_OVERLAPPING_ENTRY = "checkOverlappingEntry";
const OPTION_CHECK_AMBIGUITY = "checkAmbiguity";
const OPTION_CHECK_SIGNATURE = "checkSignature";
const OPTION_USE_WEB_WORKERS = "useWebWorkers";
const OPTION_USE_COMPRESSION_STREAM = "useCompressionStream";
const OPTION_TRANSFER_STREAMS = "transferStreams";
const OPTION_PREVENT_CLOSE = "preventClose";
const OPTION_ENCRYPTION_STRENGTH = "encryptionStrength";
const OPTION_EXTENDED_TIMESTAMP = "extendedTimestamp";
const OPTION_KEEP_ORDER = "keepOrder";
const OPTION_LEVEL = "level";
const OPTION_BUFFERED_WRITE = "bufferedWrite";
const OPTION_CREATE_TEMP_STREAM = "createTempStream";
const OPTION_DATA_DESCRIPTOR_SIGNATURE = "dataDescriptorSignature";
const OPTION_USE_UNICODE_FILE_NAMES = "useUnicodeFileNames";
const OPTION_DATA_DESCRIPTOR = "dataDescriptor";
const OPTION_SUPPORT_ZIP64_SPLIT_FILE = "supportZip64SplitFile";
const OPTION_ENCODE_TEXT = "encodeText";
const OPTION_OFFSET = "offset";
const OPTION_USDZ = "usdz";
const OPTION_UNIX_EXTRA_FIELD_TYPE = "unixExtraFieldType";
const OPTION_STRICTNESS = "strictness";
const OPTION_MAX_APPENDED_DATA_SIZE = "maxAppendedDataSize";
const STRICTNESS_STRICT = "strict";
const STRICTNESS_BALANCED = "balanced";
const STRICTNESS_TOLERANT = "tolerant";

/*
 Copyright (c) 2025 Gildas Lormeau. All rights reserved.

 Redistribution and use in source and binary forms, with or without
 modification, are permitted provided that the following conditions are met:

 1. Redistributions of source code must retain the above copyright notice,
 this list of conditions and the following disclaimer.

 2. Redistributions in binary form must reproduce the above copyright
 notice, this list of conditions and the following disclaimer in
 the documentation and/or other materials provided with the distribution.

 3. The names of the authors may not be used to endorse or promote products
 derived from this software without specific prior written permission.

 THIS SOFTWARE IS PROVIDED ''AS IS'' AND ANY EXPRESSED OR IMPLIED WARRANTIES,
 INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND
 FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL JCRAFT,
 INC. OR ANY CONTRIBUTORS TO THIS SOFTWARE BE LIABLE FOR ANY DIRECT, INDIRECT,
 INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA,
 OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
 LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
 EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */


const ERR_BAD_FORMAT = "File format is not recognized";
const ERR_EOCDR_NOT_FOUND = "End of central directory not found";
const ERR_EOCDR_LOCATOR_ZIP64_NOT_FOUND = "End of Zip64 central directory locator not found";
const ERR_CENTRAL_DIRECTORY_NOT_FOUND = "Central directory header not found";
const ERR_LOCAL_FILE_HEADER_NOT_FOUND = "Local file header not found";
const ERR_EXTRAFIELD_ZIP64_NOT_FOUND = "Zip64 extra field not found";
const ERR_ENCRYPTED = "File contains encrypted entry";
const ERR_UNSUPPORTED_ENCRYPTION = "Encryption method not supported";
const ERR_UNSUPPORTED_COMPRESSION$1 = "Compression method not supported";
const ERR_SPLIT_ZIP_FILE = "Split zip file";
const ERR_OVERLAPPING_ENTRY = "Overlapping entry found";
const ERR_AMBIGUOUS_ARCHIVE = "Ambiguous archive";
const CHARSET_UTF8 = "utf-8";
const PROPERTY_NAME_UTF8_SUFFIX = "UTF8";
const CHARSET_CP437 = "cp437";
const BITFLAG_AMBIGUITY_MASK = BITFLAG_ENCRYPTED | BITFLAG_DATA_DESCRIPTOR | BITFLAG_LANG_ENCODING_FLAG;
const ZIP64_PROPERTIES = [
	[PROPERTY_NAME_UNCOMPRESSED_SIZE, MAX_32_BITS],
	[PROPERTY_NAME_COMPRESSED_SIZE, MAX_32_BITS],
	[PROPERTY_NAME_OFFSET, MAX_32_BITS],
	[PROPERTY_NAME_DISK_NUMBER_START, MAX_16_BITS]
];
const ZIP64_EXTRACTION = {
	[MAX_16_BITS]: {
		getValue: getUint32,
		bytes: 4
	},
	[MAX_32_BITS]: {
		getValue: getBigUint64,
		bytes: 8
	}
};

class ZipReader {

	constructor(reader, options = {}) {
		Object.assign(this, {
			reader: new GenericReader(reader),
			options,
			config: getConfiguration(),
			readRanges: new Map()
		});
	}

	async* getEntriesGenerator(options = {}) {
		const zipReader = this;
		let { reader } = zipReader;
		const { config } = zipReader;
		await initStream(reader);
		if (reader.size === UNDEFINED_VALUE || !reader.readUint8Array) {
			reader = new BlobReader(await new Response(reader.readable).blob());
			await initStream(reader);
		}
		if (reader.size < END_OF_CENTRAL_DIR_LENGTH) {
			throw new Error(ERR_BAD_FORMAT);
		}
		const strictness = getStrictness(getOptionValue$1(zipReader, options, OPTION_STRICTNESS), getOptionValue$1(zipReader, options, OPTION_CHECK_AMBIGUITY));
		const checkAmbiguity = strictness == STRICTNESS_STRICT;
		const rejectAmbiguousEndOfDirectory = strictness != STRICTNESS_TOLERANT;
		const maxAppendedDataSize = getMaxAppendedDataSize(getOptionValue$1(zipReader, options, OPTION_MAX_APPENDED_DATA_SIZE), strictness);
		const { endOfDirectoryInfo, endOfDirectoryReachingEndCount } = await findEndOfCentralDirectory(reader, rejectAmbiguousEndOfDirectory, maxAppendedDataSize);
		if (!endOfDirectoryInfo) {
			const signatureArray = await readUint8Array(reader, 0, 4);
			const signatureView = getDataView$1(signatureArray);
			if (getUint32(signatureView) == SPLIT_ZIP_FILE_SIGNATURE) {
				throw new Error(ERR_SPLIT_ZIP_FILE);
			} else {
				throw new Error(ERR_EOCDR_NOT_FOUND);
			}
		}
		if (rejectAmbiguousEndOfDirectory && endOfDirectoryReachingEndCount > 1) {
			throwAmbiguousArchive("multiple end of central directory records");
		}
		const endOfDirectoryView = getDataView$1(endOfDirectoryInfo);
		let directoryDataLength = getUint32(endOfDirectoryView, 12);
		let directoryDataOffset = getUint32(endOfDirectoryView, 16);
		const commentOffset = endOfDirectoryInfo.offset;
		const commentLength = getUint16(endOfDirectoryView, 20);
		const appendedDataOffset = commentOffset + END_OF_CENTRAL_DIR_LENGTH + commentLength;
		if (reader.size - appendedDataOffset > maxAppendedDataSize) {
			throwAmbiguousArchive("appended data");
		}
		let lastDiskNumber = getUint16(endOfDirectoryView, 4);
		const expectedLastDiskNumber = reader.lastDiskNumber || 0;
		let diskNumber = getUint16(endOfDirectoryView, 6);
		let filesLength = getUint16(endOfDirectoryView, 10);
		let prependedDataLength = 0;
		let startOffset;
		let zip64EndOfDirectory;
		if (directoryDataOffset == MAX_32_BITS || directoryDataLength == MAX_32_BITS || filesLength == MAX_16_BITS || diskNumber == MAX_16_BITS) {
			const endOfDirectoryLocatorArray = endOfDirectoryInfo.offset >= ZIP64_END_OF_CENTRAL_DIR_LOCATOR_LENGTH ?
				await readUint8Array(reader, endOfDirectoryInfo.offset - ZIP64_END_OF_CENTRAL_DIR_LOCATOR_LENGTH, ZIP64_END_OF_CENTRAL_DIR_LOCATOR_LENGTH) :
				EMPTY_UINT8_ARRAY;
			const endOfDirectoryLocatorView = getDataView$1(endOfDirectoryLocatorArray);
			if (endOfDirectoryLocatorArray.length == ZIP64_END_OF_CENTRAL_DIR_LOCATOR_LENGTH &&
				getUint32(endOfDirectoryLocatorView, 0) == ZIP64_END_OF_CENTRAL_DIR_LOCATOR_SIGNATURE) {
				directoryDataOffset = getBigUint64(endOfDirectoryLocatorView, 8);
				let endOfDirectoryArray = await readUint8Array(reader, directoryDataOffset, ZIP64_END_OF_CENTRAL_DIR_LENGTH, -1);
				let endOfDirectoryView = getDataView$1(endOfDirectoryArray);
				const expectedDirectoryDataOffset = endOfDirectoryInfo.offset - ZIP64_END_OF_CENTRAL_DIR_LOCATOR_LENGTH - ZIP64_END_OF_CENTRAL_DIR_LENGTH - (reader.lastDiskOffset || 0);
				if ((endOfDirectoryArray.length < ZIP64_END_OF_CENTRAL_DIR_LENGTH || getUint32(endOfDirectoryView, 0) != ZIP64_END_OF_CENTRAL_DIR_SIGNATURE) &&
					directoryDataOffset != expectedDirectoryDataOffset && expectedDirectoryDataOffset >= 0) {
					const originalDirectoryDataOffset = directoryDataOffset;
					directoryDataOffset = expectedDirectoryDataOffset;
					if (directoryDataOffset > originalDirectoryDataOffset) {
						prependedDataLength = directoryDataOffset - originalDirectoryDataOffset;
					}
					endOfDirectoryArray = await readUint8Array(reader, directoryDataOffset, ZIP64_END_OF_CENTRAL_DIR_LENGTH, -1);
					endOfDirectoryView = getDataView$1(endOfDirectoryArray);
				}
				if (endOfDirectoryArray.length < ZIP64_END_OF_CENTRAL_DIR_LENGTH || getUint32(endOfDirectoryView, 0) != ZIP64_END_OF_CENTRAL_DIR_SIGNATURE) {
					throw new Error(ERR_EOCDR_LOCATOR_ZIP64_NOT_FOUND);
				}
				zip64EndOfDirectory = true;
				if (lastDiskNumber == MAX_16_BITS) {
					lastDiskNumber = getUint32(endOfDirectoryView, 16);
				} else if (checkAmbiguity && lastDiskNumber != getUint32(endOfDirectoryView, 16)) {
					throwAmbiguousArchive("mismatched zip64 end of central directory record");
				}
				if (diskNumber == MAX_16_BITS) {
					diskNumber = getUint32(endOfDirectoryView, 20);
				} else if (checkAmbiguity && diskNumber != getUint32(endOfDirectoryView, 20)) {
					throwAmbiguousArchive("mismatched zip64 end of central directory record");
				}
				if (filesLength == MAX_16_BITS) {
					filesLength = getBigUint64(endOfDirectoryView, 32);
				} else if (checkAmbiguity && filesLength != getBigUint64(endOfDirectoryView, 32)) {
					throwAmbiguousArchive("mismatched zip64 end of central directory record");
				}
				if (directoryDataLength == MAX_32_BITS) {
					directoryDataLength = getBigUint64(endOfDirectoryView, 40);
				} else if (checkAmbiguity && directoryDataLength != getBigUint64(endOfDirectoryView, 40)) {
					throwAmbiguousArchive("mismatched zip64 end of central directory record");
				}
				directoryDataOffset = getBigUint64(endOfDirectoryView, 48) + prependedDataLength;
			}
		}
		const declaredDirectoryDataLength = directoryDataLength;
		const centralDirectoryEndOffset = endOfDirectoryInfo.offset -
			(zip64EndOfDirectory ? ZIP64_END_OF_CENTRAL_DIR_LENGTH + ZIP64_END_OF_CENTRAL_DIR_LOCATOR_LENGTH : 0);
		if (directoryDataOffset >= reader.size) {
			prependedDataLength = reader.size - directoryDataOffset - directoryDataLength - END_OF_CENTRAL_DIR_LENGTH;
			directoryDataOffset = reader.size - directoryDataLength - END_OF_CENTRAL_DIR_LENGTH;
		}
		if (expectedLastDiskNumber != lastDiskNumber) {
			throw new Error(ERR_SPLIT_ZIP_FILE);
		}
		if (directoryDataOffset < 0) {
			throw new Error(ERR_BAD_FORMAT);
		}
		let offset = 0;
		let directoryArray = await readUint8Array(reader, directoryDataOffset, directoryDataLength, diskNumber);
		let directoryView = getDataView$1(directoryArray);
		if (directoryDataLength) {
			if (directoryArray.length < 4) {
				throw new Error(ERR_BAD_FORMAT);
			}
			const expectedDirectoryDataOffset = centralDirectoryEndOffset - directoryDataLength - (reader.lastDiskOffset || 0);
			if (directoryDataOffset != expectedDirectoryDataOffset && diskNumber == lastDiskNumber) {
				const storedPointsAtDirectory = getUint32(directoryView, offset) == CENTRAL_FILE_HEADER_SIGNATURE;
				let reconcile = !storedPointsAtDirectory;
				if (!reconcile && expectedDirectoryDataOffset >= 0 && expectedDirectoryDataOffset + 4 <= reader.size) {
					const expectedSignatureArray = await readUint8Array(reader, expectedDirectoryDataOffset, 4, diskNumber);
					reconcile = getUint32(getDataView$1(expectedSignatureArray), 0) == CENTRAL_FILE_HEADER_SIGNATURE;
				}
				if (reconcile) {
					const originalDirectoryDataOffset = directoryDataOffset;
					directoryDataOffset = expectedDirectoryDataOffset;
					if (directoryDataOffset > originalDirectoryDataOffset) {
						prependedDataLength += directoryDataOffset - originalDirectoryDataOffset;
					}
					directoryArray = await readUint8Array(reader, directoryDataOffset, directoryDataLength, diskNumber);
					directoryView = getDataView$1(directoryArray);
				}
			}
		}
		const expectedDirectoryDataLength = centralDirectoryEndOffset - directoryDataOffset - (reader.lastDiskOffset || 0);
		if (directoryDataLength != expectedDirectoryDataLength && expectedDirectoryDataLength >= 0 && diskNumber == lastDiskNumber) {
			directoryDataLength = expectedDirectoryDataLength;
			directoryArray = await readUint8Array(reader, directoryDataOffset, directoryDataLength, diskNumber);
			directoryView = getDataView$1(directoryArray);
		}
		if (directoryDataOffset < 0 || directoryDataOffset >= reader.size) {
			throw new Error(ERR_BAD_FORMAT);
		}
		startOffset = directoryDataOffset;
		const filenameEncoding = getOptionValue$1(zipReader, options, OPTION_FILENAME_ENCODING);
		const commentEncoding = getOptionValue$1(zipReader, options, OPTION_COMMENT_ENCODING);
		const filenames = checkAmbiguity ? new Set() : UNDEFINED_VALUE;
		let duplicateFilename;
		for (let indexFile = 0; indexFile < filesLength; indexFile++) {
			const fileEntry = new ZipEntry$1(reader, config, zipReader.options);
			if (offset + CENTRAL_FILE_HEADER_LENGTH > directoryArray.length || getUint32(directoryView, offset) != CENTRAL_FILE_HEADER_SIGNATURE) {
				throw new Error(ERR_CENTRAL_DIRECTORY_NOT_FOUND);
			}
			readCommonHeader(fileEntry, directoryView, offset + 6);
			const languageEncodingFlag = Boolean(fileEntry.bitFlag.languageEncodingFlag);
			const filenameOffset = offset + CENTRAL_FILE_HEADER_LENGTH;
			const extraFieldOffset = filenameOffset + fileEntry.filenameLength;
			const commentOffset = extraFieldOffset + fileEntry.extraFieldLength;
			const versionMadeBy = getUint16(directoryView, offset + 4);
			const msDosCompatible = versionMadeBy >> 8 == 0;
			const unixCompatible = versionMadeBy >> 8 == 3;
			const rawFilename = directoryArray.subarray(filenameOffset, extraFieldOffset);
			const commentLength = getUint16(directoryView, offset + 32);
			const endOffset = commentOffset + commentLength;
			const rawComment = directoryArray.subarray(commentOffset, endOffset);
			const filenameUTF8 = languageEncodingFlag;
			const commentUTF8 = languageEncodingFlag;
			const externalFileAttributes = getUint32(directoryView, offset + 38);
			const msdosAttributesRaw = externalFileAttributes & MAX_8_BITS;
			const msdosAttributes = {
				readOnly: Boolean(msdosAttributesRaw & FILE_ATTR_MSDOS_READONLY_MASK),
				hidden: Boolean(msdosAttributesRaw & FILE_ATTR_MSDOS_HIDDEN_MASK),
				system: Boolean(msdosAttributesRaw & FILE_ATTR_MSDOS_SYSTEM_MASK),
				directory: Boolean(msdosAttributesRaw & FILE_ATTR_MSDOS_DIR_MASK),
				archive: Boolean(msdosAttributesRaw & FILE_ATTR_MSDOS_ARCHIVE_MASK)
			};
			const offsetFileEntry = getUint32(directoryView, offset + 42);
			const decode = getOptionValue$1(zipReader, options, OPTION_DECODE_TEXT) || decodeText;
			const rawFilenameEncoding = filenameUTF8 ? CHARSET_UTF8 : filenameEncoding || CHARSET_CP437;
			const rawCommentEncoding = commentUTF8 ? CHARSET_UTF8 : commentEncoding || CHARSET_CP437;
			let filename = decode(rawFilename, rawFilenameEncoding);
			if (filename === UNDEFINED_VALUE) {
				filename = decodeText(rawFilename, rawFilenameEncoding);
			}
			let comment = decode(rawComment, rawCommentEncoding);
			if (comment === UNDEFINED_VALUE) {
				comment = decodeText(rawComment, rawCommentEncoding);
			}
			Object.assign(fileEntry, {
				index: indexFile,
				versionMadeBy,
				msDosCompatible,
				compressedSize: 0,
				uncompressedSize: 0,
				commentLength,
				offset: offsetFileEntry,
				diskNumberStart: getUint16(directoryView, offset + 34),
				internalFileAttributes: getUint16(directoryView, offset + 36),
				externalFileAttributes,
				msdosAttributesRaw,
				msdosAttributes,
				rawFilename,
				filenameUTF8,
				commentUTF8,
				rawExtraField: directoryArray.subarray(extraFieldOffset, commentOffset),
				rawComment,
				filename,
				comment
			});
			readCommonFooter(fileEntry, fileEntry, directoryView, offset + 6);
			fileEntry.offset += prependedDataLength;
			startOffset = Math.min(fileEntry.offset, startOffset);
			if (checkAmbiguity) {
				if (filenames.has(fileEntry.filename)) {
					duplicateFilename = true;
				}
				filenames.add(fileEntry.filename);
			}
			const unixExternalUpper = (fileEntry.externalFileAttributes >> 16) & MAX_16_BITS;
			if (fileEntry.unixMode === UNDEFINED_VALUE && (unixExternalUpper & (FILE_ATTR_UNIX_DEFAULT_MASK | FILE_ATTR_UNIX_EXECUTABLE_MASK | FILE_ATTR_UNIX_TYPE_DIR)) != 0) {
				fileEntry.unixMode = unixExternalUpper;
			}
			const setuid = Boolean(fileEntry.unixMode & FILE_ATTR_UNIX_SETUID_MASK);
			const setgid = Boolean(fileEntry.unixMode & FILE_ATTR_UNIX_SETGID_MASK);
			const sticky = Boolean(fileEntry.unixMode & FILE_ATTR_UNIX_STICKY_MASK);
			const executable = (fileEntry.unixMode !== UNDEFINED_VALUE)
				? ((fileEntry.unixMode & FILE_ATTR_UNIX_EXECUTABLE_MASK) != 0)
				: (unixCompatible && ((unixExternalUpper & FILE_ATTR_UNIX_EXECUTABLE_MASK) != 0));
			const modeIsDir = fileEntry.unixMode !== UNDEFINED_VALUE && ((fileEntry.unixMode & FILE_ATTR_UNIX_TYPE_MASK) == FILE_ATTR_UNIX_TYPE_DIR);
			const upperIsDir = ((unixExternalUpper & FILE_ATTR_UNIX_TYPE_MASK) == FILE_ATTR_UNIX_TYPE_DIR);
			Object.assign(fileEntry, {
				setuid,
				setgid,
				sticky,
				unixExternalUpper,
				internalFileAttribute: fileEntry.internalFileAttributes,
				externalFileAttribute: fileEntry.externalFileAttributes,
				executable,
				directory: modeIsDir || upperIsDir || (msDosCompatible && msdosAttributes.directory) || (fileEntry.filename.endsWith(DIRECTORY_SIGNATURE) && !fileEntry.uncompressedSize),
				zipCrypto: fileEntry.encrypted && !fileEntry.extraFieldAES
			});
			const entry = new Entry(fileEntry);
			entry.getData = (writer, options) => fileEntry.getData(writer, entry, zipReader.readRanges, options);
			entry.arrayBuffer = async options => {
				const writer = new TransformStream();
				const [arrayBuffer] = await Promise.all([
					new Response(writer.readable).arrayBuffer(),
					fileEntry.getData(writer, entry, zipReader.readRanges, options)]);
				return arrayBuffer;
			};
			offset = endOffset;
			const { onprogress } = options;
			if (onprogress) {
				try {
					await onprogress(indexFile + 1, filesLength, new Entry(fileEntry));
				} catch {
					// ignored
				}
			}
			yield entry;
		}
		if (checkAmbiguity && offset != declaredDirectoryDataLength) {
			throwAmbiguousArchive("trailing central directory data");
		}
		if (duplicateFilename) {
			throwAmbiguousArchive("duplicate filename");
		}
		if (checkAmbiguity && (prependedDataLength || (filesLength && startOffset > 0))) {
			throwAmbiguousArchive("prepended data");
		}
		const extractPrependedData = getOptionValue$1(zipReader, options, OPTION_EXTRACT_PREPENDED_DATA);
		const extractAppendedData = getOptionValue$1(zipReader, options, OPTION_EXTRACT_APPENDED_DATA);
		if (extractPrependedData) {
			zipReader.prependedData = startOffset > 0 ? await readUint8Array(reader, 0, startOffset) : EMPTY_UINT8_ARRAY;
		}
		zipReader.comment = commentLength ? await readUint8Array(reader, commentOffset + END_OF_CENTRAL_DIR_LENGTH, commentLength) : EMPTY_UINT8_ARRAY;
		if (extractAppendedData) {
			zipReader.appendedData = appendedDataOffset < reader.size ? await readUint8Array(reader, appendedDataOffset, reader.size - appendedDataOffset) : EMPTY_UINT8_ARRAY;
		}
		return true;
	}

	async getEntries(options = {}) {
		const entries = [];
		for await (const entry of this.getEntriesGenerator(options)) {
			entries.push(entry);
		}
		return entries;
	}

	async close() {
	}
}

class ZipReaderStream {

	constructor(options = {}) {
		const { readable, writable } = new TransformStream();
		const gen = new ZipReader(readable, options).getEntriesGenerator();
		this.readable = new ReadableStream({
			async pull(controller) {
				const { done, value } = await gen.next();
				if (done)
					return controller.close();
				const chunk = {
					...value,
					readable: (function () {
						const { readable, writable } = new TransformStream();
						if (value.getData) {
							getData();
							return readable;
						}

						async function getData() {
							try {
								await value.getData(writable);
							} catch (error) {
								try {
									await writable.abort(error);
								} catch {
									// ignored
								}
							}
						}
					})()
				};
				delete chunk.getData;
				controller.enqueue(chunk);
			}
		});
		this.writable = writable;
	}
}

let ZipEntry$1 = class ZipEntry {

	constructor(reader, config, options) {
		Object.assign(this, {
			reader,
			config,
			options
		});
	}

	async getData(writer, fileEntry, readRanges, options = {}) {
		const zipEntry = this;
		const {
			reader,
			index,
			offset,
			diskNumberStart,
			extraFieldAES,
			extraFieldZip64,
			compressionMethod,
			config,
			bitFlag,
			signature,
			rawLastModDate,
			uncompressedSize,
			compressedSize
		} = zipEntry;
		const {
			dataDescriptor
		} = bitFlag;
		const localDirectory = fileEntry.localDirectory = {};
		const dataArray = await readUint8Array(reader, offset, HEADER_SIZE, diskNumberStart);
		const dataView = getDataView$1(dataArray);
		let password = getOptionValue$1(zipEntry, options, OPTION_PASSWORD);
		let rawPassword = getOptionValue$1(zipEntry, options, OPTION_RAW_PASSWORD);
		const passThrough = getOptionValue$1(zipEntry, options, OPTION_PASS_THROUGH);
		password = password && password.length && password;
		rawPassword = rawPassword && rawPassword.length && rawPassword;
		if (extraFieldAES) {
			if (extraFieldAES.originalCompressionMethod != COMPRESSION_METHOD_AES) {
				throw new Error(ERR_UNSUPPORTED_COMPRESSION$1);
			}
		}
		if ((compressionMethod != COMPRESSION_METHOD_STORE && compressionMethod != COMPRESSION_METHOD_DEFLATE && compressionMethod != COMPRESSION_METHOD_DEFLATE_64) && !passThrough) {
			throw new Error(ERR_UNSUPPORTED_COMPRESSION$1);
		}
		if (dataArray.length < HEADER_SIZE || getUint32(dataView, 0) != LOCAL_FILE_HEADER_SIGNATURE) {
			throw new Error(ERR_LOCAL_FILE_HEADER_NOT_FOUND);
		}
		readCommonHeader(localDirectory, dataView, 4);
		const {
			extraFieldLength,
			filenameLength
		} = localDirectory;
		const checkAmbiguity = getStrictness(getOptionValue$1(zipEntry, options, OPTION_STRICTNESS), getOptionValue$1(zipEntry, options, OPTION_CHECK_AMBIGUITY)) == STRICTNESS_STRICT;
		let rawLocalFilename = EMPTY_UINT8_ARRAY;
		if (checkAmbiguity && (filenameLength || extraFieldLength)) {
			const trailingDataArray = await readUint8Array(reader, offset + HEADER_SIZE, filenameLength + extraFieldLength, diskNumberStart);
			rawLocalFilename = trailingDataArray.subarray(0, filenameLength);
			localDirectory.rawExtraField = trailingDataArray.subarray(filenameLength);
		} else {
			localDirectory.rawExtraField = extraFieldLength ?
				await readUint8Array(reader, offset + HEADER_SIZE + filenameLength, extraFieldLength, diskNumberStart) :
				EMPTY_UINT8_ARRAY;
		}
		readCommonFooter(zipEntry, localDirectory, dataView, 4, true);
		if (checkAmbiguity) {
			checkLocalDirectory(zipEntry, localDirectory, rawLocalFilename);
		}
		const { lastAccessDate, creationDate } = localDirectory;
		if (lastAccessDate) {
			fileEntry.lastAccessDate = lastAccessDate;
		}
		if (creationDate) {
			fileEntry.creationDate = creationDate;
		}
		const encrypted = zipEntry.encrypted && localDirectory.encrypted && !passThrough;
		const zipCrypto = encrypted && !extraFieldAES;
		if (!passThrough) {
			fileEntry.zipCrypto = zipCrypto;
		}
		if (encrypted) {
			if (!zipCrypto && extraFieldAES.strength === UNDEFINED_VALUE) {
				throw new Error(ERR_UNSUPPORTED_ENCRYPTION);
			} else if (!password && !rawPassword) {
				throw new Error(ERR_ENCRYPTED);
			}
		}
		const dataOffset = offset + HEADER_SIZE + filenameLength + extraFieldLength;
		const size = compressedSize;
		const readable = reader.createReadable({ offset: dataOffset, size, diskNumberStart, chunkSize: getChunkSize(config) });
		const signal = getOptionValue$1(zipEntry, options, OPTION_SIGNAL);
		const checkPasswordOnly = getOptionValue$1(zipEntry, options, OPTION_CHECK_PASSWORD_ONLY);
		let checkOverlappingEntry = getOptionValue$1(zipEntry, options, OPTION_CHECK_OVERLAPPING_ENTRY);
		const checkOverlappingEntryOnly = getOptionValue$1(zipEntry, options, OPTION_CHECK_OVERLAPPING_ENTRY_ONLY);
		if (checkOverlappingEntryOnly) {
			checkOverlappingEntry = true;
		}
		const { onstart, onprogress, onend } = options;
		const deflate64 = compressionMethod == COMPRESSION_METHOD_DEFLATE_64;
		let useCompressionStream = getOptionValue$1(zipEntry, options, OPTION_USE_COMPRESSION_STREAM);
		if (deflate64) {
			useCompressionStream = false;
		}
		const workerOptions = {
			options: {
				codecType: CODEC_INFLATE,
				password,
				rawPassword,
				zipCrypto,
				encryptionStrength: extraFieldAES && extraFieldAES.strength,
				signed: getOptionValue$1(zipEntry, options, OPTION_CHECK_SIGNATURE) && !passThrough,
				passwordVerification: zipCrypto && (dataDescriptor ? ((rawLastModDate >>> 8) & MAX_8_BITS) : ((signature >>> 24) & MAX_8_BITS)),
				outputSize: passThrough ? compressedSize : uncompressedSize,
				signature,
				compressed: compressionMethod != 0 && !passThrough,
				encrypted,
				useWebWorkers: getOptionValue$1(zipEntry, options, OPTION_USE_WEB_WORKERS),
				useCompressionStream,
				transferStreams: getOptionValue$1(zipEntry, options, OPTION_TRANSFER_STREAMS),
				deflate64,
				checkPasswordOnly
			},
			config,
			streamOptions: { signal, size, onstart, onprogress, onend }
		};
		if (checkOverlappingEntry) {
			await detectOverlappingEntry({
				reader,
				fileEntry,
				index,
				offset,
				diskNumberStart,
				signature,
				compressedSize,
				uncompressedSize,
				dataOffset,
				dataDescriptor: dataDescriptor || localDirectory.bitFlag.dataDescriptor,
				extraFieldZip64: extraFieldZip64 || localDirectory.extraFieldZip64,
				readRanges
			});
		}
		let writable;
		try {
			if (!checkOverlappingEntryOnly) {
				if (checkPasswordOnly) {
					writer = new WritableStream();
				}
				writer = new GenericWriter(writer);
				await initStream(writer, passThrough ? compressedSize : uncompressedSize);
				({ writable } = writer);
				const { outputSize } = await runWorker({ readable, writable }, workerOptions);
				writer.size += outputSize;
				if (outputSize != (passThrough ? compressedSize : uncompressedSize)) {
					throw new Error(ERR_INVALID_UNCOMPRESSED_SIZE);
				}
			}
		} catch (error) {
			if (error.outputSize !== UNDEFINED_VALUE) {
				writer.size += error.outputSize;
			}
			if (!checkPasswordOnly || error.message != ERR_ABORT_CHECK_PASSWORD) {
				throw error;
			}
		} finally {
			const preventClose = getOptionValue$1(zipEntry, options, OPTION_PREVENT_CLOSE);
			if (!preventClose && writable && !writable.locked) {
				await writable.getWriter().close();
			}
		}
		return checkPasswordOnly || checkOverlappingEntryOnly ? UNDEFINED_VALUE : writer.getData ? writer.getData() : writable;
	}
};

function readCommonHeader(directory, dataView, offset) {
	const rawBitFlag = directory.rawBitFlag = getUint16(dataView, offset + 2);
	const encrypted = (rawBitFlag & BITFLAG_ENCRYPTED) == BITFLAG_ENCRYPTED;
	const rawLastModDate = getUint32(dataView, offset + 6);
	Object.assign(directory, {
		encrypted,
		version: getUint16(dataView, offset),
		bitFlag: {
			level: (rawBitFlag & BITFLAG_LEVEL) >> 1,
			dataDescriptor: (rawBitFlag & BITFLAG_DATA_DESCRIPTOR) == BITFLAG_DATA_DESCRIPTOR,
			languageEncodingFlag: (rawBitFlag & BITFLAG_LANG_ENCODING_FLAG) == BITFLAG_LANG_ENCODING_FLAG
		},
		rawLastModDate,
		lastModDate: getDate(rawLastModDate),
		filenameLength: getUint16(dataView, offset + 22),
		extraFieldLength: getUint16(dataView, offset + 24)
	});
}

function readCommonFooter(fileEntry, directory, dataView, offset, localDirectory) {
	const { rawExtraField } = directory;
	const extraField = directory.extraField = new Map();
	const rawExtraFieldView = getDataView$1(new Uint8Array(rawExtraField));
	let offsetExtraField = 0;
	try {
		while (offsetExtraField < rawExtraField.length) {
			const type = getUint16(rawExtraFieldView, offsetExtraField);
			const size = getUint16(rawExtraFieldView, offsetExtraField + 2);
			extraField.set(type, {
				type,
				data: rawExtraField.slice(offsetExtraField + 4, offsetExtraField + 4 + size)
			});
			offsetExtraField += 4 + size;
		}
	} catch {
		// ignored
	}
	const compressionMethod = getUint16(dataView, offset + 4);
	Object.assign(directory, {
		signature: getUint32(dataView, offset + HEADER_OFFSET_SIGNATURE),
		compressedSize: getUint32(dataView, offset + HEADER_OFFSET_COMPRESSED_SIZE),
		uncompressedSize: getUint32(dataView, offset + HEADER_OFFSET_UNCOMPRESSED_SIZE)
	});
	const extraFieldZip64 = extraField.get(EXTRAFIELD_TYPE_ZIP64);
	if (extraFieldZip64) {
		readExtraFieldZip64(extraFieldZip64, directory);
		directory.extraFieldZip64 = extraFieldZip64;
	}
	const extraFieldUnicodePath = extraField.get(EXTRAFIELD_TYPE_UNICODE_PATH);
	if (extraFieldUnicodePath) {
		readExtraFieldUnicode(extraFieldUnicodePath, PROPERTY_NAME_FILENAME, PROPERTY_NAME_RAW_FILENAME, directory, fileEntry);
		directory.extraFieldUnicodePath = extraFieldUnicodePath;
	}
	const extraFieldUnicodeComment = extraField.get(EXTRAFIELD_TYPE_UNICODE_COMMENT);
	if (extraFieldUnicodeComment) {
		readExtraFieldUnicode(extraFieldUnicodeComment, PROPERTY_NAME_COMMENT, PROPERTY_NAME_RAW_COMMENT, directory, fileEntry);
		directory.extraFieldUnicodeComment = extraFieldUnicodeComment;
	}
	const extraFieldAES = extraField.get(EXTRAFIELD_TYPE_AES);
	if (extraFieldAES && extraFieldAES.data.length >= 7) {
		readExtraFieldAES(extraFieldAES, directory, compressionMethod);
		directory.extraFieldAES = extraFieldAES;
	} else {
		directory.compressionMethod = compressionMethod;
	}
	const extraFieldNTFS = extraField.get(EXTRAFIELD_TYPE_NTFS);
	if (extraFieldNTFS) {
		readExtraFieldNTFS(extraFieldNTFS, directory);
		directory.extraFieldNTFS = extraFieldNTFS;
	}
	const extraFieldUnix = extraField.get(EXTRAFIELD_TYPE_UNIX);
	if (extraFieldUnix) {
		readExtraFieldUnix(extraFieldUnix, directory, false);
		directory.extraFieldUnix = extraFieldUnix;
	} else {
		const extraFieldInfoZip = extraField.get(EXTRAFIELD_TYPE_INFOZIP);
		if (extraFieldInfoZip) {
			readExtraFieldUnix(extraFieldInfoZip, directory, true);
			directory.extraFieldInfoZip = extraFieldInfoZip;
		}
	}
	const extraFieldExtendedTimestamp = extraField.get(EXTRAFIELD_TYPE_EXTENDED_TIMESTAMP);
	if (extraFieldExtendedTimestamp) {
		readExtraFieldExtendedTimestamp(extraFieldExtendedTimestamp, directory, localDirectory);
		directory.extraFieldExtendedTimestamp = extraFieldExtendedTimestamp;
	}
	const extraFieldUSDZ = extraField.get(EXTRAFIELD_TYPE_USDZ);
	if (extraFieldUSDZ) {
		directory.extraFieldUSDZ = extraFieldUSDZ;
	}
}

function readExtraFieldZip64(extraFieldZip64, directory) {
	directory.zip64 = true;
	const extraFieldView = getDataView$1(extraFieldZip64.data);
	const missingProperties = ZIP64_PROPERTIES.filter(([propertyName, max]) => directory[propertyName] == max);
	const requiredLength = missingProperties.reduce((length, [, max]) => length + ZIP64_EXTRACTION[max].bytes, 0);
	if (extraFieldZip64.data.length < requiredLength) {
		throw new Error(ERR_EXTRAFIELD_ZIP64_NOT_FOUND);
	}
	for (let indexMissingProperty = 0, offset = 0; indexMissingProperty < missingProperties.length; indexMissingProperty++) {
		const [propertyName, max] = missingProperties[indexMissingProperty];
		const extraction = ZIP64_EXTRACTION[max];
		directory[propertyName] = extraFieldZip64[propertyName] = extraction.getValue(extraFieldView, offset);
		offset += extraction.bytes;
	}
}

function readExtraFieldUnicode(extraFieldUnicode, propertyName, rawPropertyName, directory, fileEntry) {
	if (extraFieldUnicode.data.length < 5) {
		extraFieldUnicode.valid = false;
		return;
	}
	const extraFieldView = getDataView$1(extraFieldUnicode.data);
	const crc32 = new Crc32();
	crc32.append(fileEntry[rawPropertyName]);
	const dataViewSignature = getDataView$1(new Uint8Array(4));
	dataViewSignature.setUint32(0, crc32.get(), true);
	const signature = getUint32(extraFieldView, 1);
	Object.assign(extraFieldUnicode, {
		version: getUint8(extraFieldView, 0),
		[propertyName]: decodeText(extraFieldUnicode.data.subarray(5)),
		valid: !fileEntry.bitFlag.languageEncodingFlag && signature == getUint32(dataViewSignature, 0)
	});
	if (extraFieldUnicode.valid) {
		directory[propertyName] = extraFieldUnicode[propertyName];
		directory[propertyName + PROPERTY_NAME_UTF8_SUFFIX] = true;
	}
}

function readExtraFieldAES(extraFieldAES, directory, compressionMethod) {
	const extraFieldView = getDataView$1(extraFieldAES.data);
	const strength = getUint8(extraFieldView, 4);
	Object.assign(extraFieldAES, {
		vendorVersion: getUint8(extraFieldView, 0),
		vendorId: getUint8(extraFieldView, 2),
		strength,
		originalCompressionMethod: compressionMethod,
		compressionMethod: getUint16(extraFieldView, 5)
	});
	directory.compressionMethod = extraFieldAES.compressionMethod;
}

function readExtraFieldNTFS(extraFieldNTFS, directory) {
	const extraFieldView = getDataView$1(extraFieldNTFS.data);
	let offsetExtraField = 4;
	let tag1Data;
	try {
		while (offsetExtraField < extraFieldNTFS.data.length && !tag1Data) {
			const tagValue = getUint16(extraFieldView, offsetExtraField);
			const attributeSize = getUint16(extraFieldView, offsetExtraField + 2);
			if (tagValue == EXTRAFIELD_TYPE_NTFS_TAG1) {
				tag1Data = extraFieldNTFS.data.slice(offsetExtraField + 4, offsetExtraField + 4 + attributeSize);
			}
			offsetExtraField += 4 + attributeSize;
		}
	} catch {
		// ignored
	}
	try {
		if (tag1Data && tag1Data.length == 24) {
			const tag1View = getDataView$1(tag1Data);
			const rawLastModDate = tag1View.getBigUint64(0, true);
			const rawLastAccessDate = tag1View.getBigUint64(8, true);
			const rawCreationDate = tag1View.getBigUint64(16, true);
			Object.assign(extraFieldNTFS, {
				rawLastModDate,
				rawLastAccessDate,
				rawCreationDate
			});
			const lastModDate = getDateNTFS(rawLastModDate);
			const lastAccessDate = getDateNTFS(rawLastAccessDate);
			const creationDate = getDateNTFS(rawCreationDate);
			const extraFieldData = { lastModDate, lastAccessDate, creationDate };
			Object.assign(extraFieldNTFS, extraFieldData);
			Object.assign(directory, extraFieldData);
		}
	} catch {
		// ignored
	}
}

function readExtraFieldUnix(extraField, directory, isInfoZip) {
	try {
		const view = getDataView$1(new Uint8Array(extraField.data));
		let uid, gid;
		if (isInfoZip) {
			let offset = 0;
			const version = getUint8(view, offset++);
			const uidSize = getUint8(view, offset++);
			uid = unpackUnixId(extraField.data.subarray(offset, offset + uidSize));
			offset += uidSize;
			const gidSize = getUint8(view, offset++);
			gid = unpackUnixId(extraField.data.subarray(offset, offset + gidSize));
			Object.assign(extraField, { version, uid, gid });
		} else if (extraField.data.length >= 4) {
			uid = getUint16(view, 0);
			gid = getUint16(view, 2);
			Object.assign(extraField, { uid, gid });
		}
		if (uid !== UNDEFINED_VALUE) {
			directory.uid = uid;
		}
		if (gid !== UNDEFINED_VALUE) {
			directory.gid = gid;
		}
	} catch {
		// ignored
	}
}

function unpackUnixId(bytes) {
	const buffer = new Uint8Array(4);
	buffer.set(bytes, 0);
	const view = new DataView(buffer.buffer, buffer.byteOffset, 4);
	return view.getUint32(0, true);
}

function readExtraFieldExtendedTimestamp(extraFieldExtendedTimestamp, directory, localDirectory) {
	if (!extraFieldExtendedTimestamp.data.length) {
		return;
	}
	const extraFieldView = getDataView$1(extraFieldExtendedTimestamp.data);
	const flags = getUint8(extraFieldView, 0);
	const timeProperties = [];
	const timeRawProperties = [];
	if (localDirectory) {
		if ((flags & 0x1) == 0x1) {
			timeProperties.push(PROPERTY_NAME_LAST_MODIFICATION_DATE);
			timeRawProperties.push(PROPERTY_NAME_RAW_LAST_MODIFICATION_DATE);
		}
		if ((flags & 0x2) == 0x2) {
			timeProperties.push(PROPERTY_NAME_LAST_ACCESS_DATE);
			timeRawProperties.push(PROPERTY_NAME_RAW_LAST_ACCESS_DATE);
		}
		if ((flags & 0x4) == 0x4) {
			timeProperties.push(PROPERTY_NAME_CREATION_DATE);
			timeRawProperties.push(PROPERTY_NAME_RAW_CREATION_DATE);
		}
	} else if (extraFieldExtendedTimestamp.data.length >= 5) {
		timeProperties.push(PROPERTY_NAME_LAST_MODIFICATION_DATE);
		timeRawProperties.push(PROPERTY_NAME_RAW_LAST_MODIFICATION_DATE);
	}
	let offset = 1;
	timeProperties.forEach((propertyName, indexProperty) => {
		if (extraFieldExtendedTimestamp.data.length >= offset + 4) {
			const time = getUint32(extraFieldView, offset);
			directory[propertyName] = extraFieldExtendedTimestamp[propertyName] = new Date((time | 0) * 1000);
			const rawPropertyName = timeRawProperties[indexProperty];
			extraFieldExtendedTimestamp[rawPropertyName] = time;
		}
		offset += 4;
	});
}

async function detectOverlappingEntry({
	reader,
	fileEntry,
	index,
	offset,
	diskNumberStart,
	signature,
	compressedSize,
	uncompressedSize,
	dataOffset,
	dataDescriptor,
	extraFieldZip64,
	readRanges
}) {
	let diskOffset = 0;
	if (diskNumberStart && reader.readers) {
		for (let indexReader = 0; indexReader < Math.min(diskNumberStart, reader.readers.length); indexReader++) {
			diskOffset += reader.readers[indexReader].size;
		}
	}
	let dataDescriptorLength = 0;
	if (dataDescriptor) {
		if (extraFieldZip64) {
			dataDescriptorLength = DATA_DESCRIPTOR_RECORD_ZIP_64_LENGTH;
		} else {
			dataDescriptorLength = DATA_DESCRIPTOR_RECORD_LENGTH;
		}
	}
	if (dataDescriptorLength) {
		const dataDescriptorArray = await readUint8Array(reader, dataOffset + compressedSize, dataDescriptorLength + DATA_DESCRIPTOR_RECORD_SIGNATURE_LENGTH, diskNumberStart);
		const dataDescriptorSignature = dataDescriptorArray.length == dataDescriptorLength + DATA_DESCRIPTOR_RECORD_SIGNATURE_LENGTH &&
			getUint32(getDataView$1(dataDescriptorArray), 0) == DATA_DESCRIPTOR_RECORD_SIGNATURE;
		if (dataDescriptorSignature) {
			const readSignature = getUint32(getDataView$1(dataDescriptorArray), 4);
			let readCompressedSize;
			let readUncompressedSize;
			if (extraFieldZip64) {
				readCompressedSize = getBigUint64(getDataView$1(dataDescriptorArray), 8);
				readUncompressedSize = getBigUint64(getDataView$1(dataDescriptorArray), 16);
			} else {
				readCompressedSize = getUint32(getDataView$1(dataDescriptorArray), 8);
				readUncompressedSize = getUint32(getDataView$1(dataDescriptorArray), 12);
			}
			const matchSignature = (fileEntry.encrypted && !fileEntry.zipCrypto) || readSignature == signature;
			if (matchSignature &&
				readCompressedSize == compressedSize &&
				readUncompressedSize == uncompressedSize) {
				dataDescriptorLength += DATA_DESCRIPTOR_RECORD_SIGNATURE_LENGTH;
			}
		}
	}
	const range = {
		start: diskOffset + offset,
		end: diskOffset + dataOffset + compressedSize + dataDescriptorLength,
		fileEntry
	};
	for (const [otherIndex, otherRange] of readRanges) {
		if (otherIndex != index && range.start < otherRange.end && otherRange.start < range.end) {
			const error = new Error(ERR_OVERLAPPING_ENTRY);
			error.overlappingEntry = otherRange.fileEntry;
			throw error;
		}
	}
	readRanges.set(index, range);
}

function getStrictness(strictness, checkAmbiguity) {
	if (strictness === UNDEFINED_VALUE) {
		return checkAmbiguity ? STRICTNESS_STRICT : STRICTNESS_BALANCED;
	}
	return strictness;
}

function getMaxAppendedDataSize(maxAppendedDataSize, strictness) {
	if (maxAppendedDataSize !== UNDEFINED_VALUE) {
		return maxAppendedDataSize;
	}
	if (strictness == STRICTNESS_STRICT) {
		return 0;
	}
	if (strictness == STRICTNESS_TOLERANT) {
		return Infinity;
	}
	return MAX_16_BITS;
}

const MAX_END_OF_CENTRAL_DIR_PROBES = 64;

const CENTRAL_DIRECTORY_UNREACHABLE = 0;
const CENTRAL_DIRECTORY_PLAUSIBLE = 1;
const CENTRAL_DIRECTORY_REACHABLE = 2;

async function findEndOfCentralDirectory(reader, rejectAmbiguous, maxAppendedDataSize) {
	const { size } = reader;
	const anchoredLength = Math.min(size, END_OF_CENTRAL_DIR_LENGTH + MAX_16_BITS);
	const remoteProbeBudget = { count: MAX_END_OF_CENTRAL_DIR_PROBES };
	let endOfDirectoryInfo;
	let plausibleEndOfDirectoryInfo;
	let endOfDirectoryReachingEndCount = 0;
	for await (const [anchoredView, anchoredOffset, anchoredArray, indexByte, offset] of scanEndOfCentralDirectory(reader, anchoredLength)) {
		const commentLength = getUint16(anchoredView, indexByte + 20);
		if (offset + END_OF_CENTRAL_DIR_LENGTH + commentLength == size) {
			const reachability = await getCentralDirectoryReachability(reader, anchoredView, anchoredOffset, indexByte, offset, size, remoteProbeBudget);
			if (reachability == CENTRAL_DIRECTORY_REACHABLE) {
				if (!endOfDirectoryInfo) {
					endOfDirectoryInfo = getEndOfCentralDirectoryInfo(anchoredArray, indexByte, offset);
				}
				endOfDirectoryReachingEndCount++;
				if (!rejectAmbiguous || endOfDirectoryReachingEndCount > 1) {
					break;
				}
			} else if (reachability == CENTRAL_DIRECTORY_PLAUSIBLE && !plausibleEndOfDirectoryInfo) {
				plausibleEndOfDirectoryInfo = getEndOfCentralDirectoryInfo(anchoredArray, indexByte, offset);
			}
		}
	}
	if (!endOfDirectoryInfo) {
		endOfDirectoryInfo = plausibleEndOfDirectoryInfo;
	}
	if (!endOfDirectoryInfo) {
		endOfDirectoryInfo = await seekEndOfCentralDirectory(reader, maxAppendedDataSize, remoteProbeBudget);
	}
	return { endOfDirectoryInfo, endOfDirectoryReachingEndCount };
}

async function seekEndOfCentralDirectory(reader, maxAppendedDataSize, remoteProbeBudget) {
	const { size } = reader;
	const searchLength = Math.min(size, maxAppendedDataSize == Infinity ? size :
		END_OF_CENTRAL_DIR_LENGTH + MAX_16_BITS + maxAppendedDataSize);
	let firstSignatureInfo, plausibleInfo;
	for await (const [searchView, searchOffset, searchArray, indexByte, offset] of scanEndOfCentralDirectory(reader, searchLength)) {
		const record = getEndOfCentralDirectoryInfo(searchArray, indexByte, offset);
		if (!firstSignatureInfo) {
			firstSignatureInfo = record;
		}
		const reachability = await getCentralDirectoryReachability(reader, searchView, searchOffset, indexByte, offset, size, remoteProbeBudget);
		if (reachability == CENTRAL_DIRECTORY_REACHABLE) {
			return record;
		}
		if (reachability == CENTRAL_DIRECTORY_PLAUSIBLE && !plausibleInfo) {
			plausibleInfo = record;
		}
	}
	return plausibleInfo || firstSignatureInfo;
}

async function* scanEndOfCentralDirectory(reader, scanLength) {
	const scanOffset = reader.size - scanLength;
	const scanArray = await readUint8Array(reader, scanOffset, scanLength);
	const scanView = getDataView$1(scanArray);
	for (let indexByte = scanArray.length - END_OF_CENTRAL_DIR_LENGTH; indexByte >= 0; indexByte--) {
		if (getUint32(scanView, indexByte) == END_OF_CENTRAL_DIR_SIGNATURE) {
			yield [scanView, scanOffset, scanArray, indexByte, scanOffset + indexByte];
		}
	}
}

function getEndOfCentralDirectoryInfo(scanArray, indexByte, offset) {
	return { offset, buffer: scanArray.slice(indexByte, indexByte + END_OF_CENTRAL_DIR_LENGTH).buffer };
}

async function getCentralDirectoryReachability(reader, view, anchoredOffset, indexByte, offset, size, remoteProbeBudget) {
	const filesLength = getUint16(view, indexByte + 10);
	const directoryDataLength = getUint32(view, indexByte + 12);
	const directoryDataOffset = getUint32(view, indexByte + 16);
	if (filesLength == MAX_16_BITS || directoryDataLength == MAX_32_BITS || directoryDataOffset == MAX_32_BITS) {
		const locatorSignature = await readSignature(reader, view, anchoredOffset, offset - ZIP64_END_OF_CENTRAL_DIR_LOCATOR_LENGTH, size, remoteProbeBudget);
		return locatorSignature == ZIP64_END_OF_CENTRAL_DIR_LOCATOR_SIGNATURE ? CENTRAL_DIRECTORY_REACHABLE : CENTRAL_DIRECTORY_UNREACHABLE;
	}
	if (!filesLength && !directoryDataLength) {
		return CENTRAL_DIRECTORY_PLAUSIBLE;
	}
	for (const centralDirectoryOffset of [offset - directoryDataLength, directoryDataOffset]) {
		if (await readSignature(reader, view, anchoredOffset, centralDirectoryOffset, size, remoteProbeBudget) == CENTRAL_FILE_HEADER_SIGNATURE) {
			return CENTRAL_DIRECTORY_REACHABLE;
		}
	}
	return CENTRAL_DIRECTORY_UNREACHABLE;
}

async function readSignature(reader, view, anchoredOffset, signatureOffset, size, remoteProbeBudget) {
	if (signatureOffset < 0 || signatureOffset + 4 > size) {
		return UNDEFINED_VALUE;
	}
	if (signatureOffset >= anchoredOffset) {
		return getUint32(view, signatureOffset - anchoredOffset);
	}
	if (remoteProbeBudget.count > 0) {
		remoteProbeBudget.count--;
		const signatureArray = await readUint8Array(reader, signatureOffset, 4);
		return getUint32(getDataView$1(signatureArray), 0);
	}
	return UNDEFINED_VALUE;
}

function checkLocalDirectory(zipEntry, localDirectory, rawLocalFilename) {
	const { rawFilename } = zipEntry;
	if (rawLocalFilename.length != rawFilename.length ||
		rawLocalFilename.some((byteValue, indexByte) => byteValue != rawFilename[indexByte])) {
		throwAmbiguousArchive("mismatched local file header (filename)");
	}
	if ((localDirectory.rawBitFlag & BITFLAG_AMBIGUITY_MASK) != (zipEntry.rawBitFlag & BITFLAG_AMBIGUITY_MASK)) {
		throwAmbiguousArchive("mismatched local file header (general purpose bit flag)");
	}
	if (localDirectory.compressionMethod != zipEntry.compressionMethod) {
		throwAmbiguousArchive("mismatched local file header (compression method)");
	}
	if (!localDirectory.bitFlag.dataDescriptor &&
		(localDirectory.signature || localDirectory.compressedSize || localDirectory.uncompressedSize) &&
		(localDirectory.signature != zipEntry.signature ||
			localDirectory.compressedSize != zipEntry.compressedSize ||
			localDirectory.uncompressedSize != zipEntry.uncompressedSize)) {
		throwAmbiguousArchive("mismatched local file header (signature or sizes)");
	}
}

function throwAmbiguousArchive(reason) {
	const error = new Error(ERR_AMBIGUOUS_ARCHIVE);
	error.reason = reason;
	throw error;
}

function getOptionValue$1(zipReader, options, name) {
	return options[name] === UNDEFINED_VALUE ? zipReader.options[name] : options[name];
}

function getDate(timeRaw) {
	const date = (timeRaw & 0xffff0000) >> 16, time = timeRaw & MAX_16_BITS;
	try {
		return new Date(1980 + ((date & 0xFE00) >> 9), ((date & 0x01E0) >> 5) - 1, date & 0x001F, (time & 0xF800) >> 11, (time & 0x07E0) >> 5, (time & 0x001F) * 2, 0);
	} catch {
		// ignored
	}
}

function getDateNTFS(timeRaw) {
	return new Date((Number((timeRaw / BigInt(10000)) - BigInt(11644473600000))));
}

function getUint8(view, offset) {
	return view.getUint8(offset);
}

function getUint16(view, offset) {
	return view.getUint16(offset, true);
}

function getUint32(view, offset) {
	return view.getUint32(offset, true);
}

function getBigUint64(view, offset) {
	return Number(view.getBigUint64(offset, true));
}

function getDataView$1(array) {
	return new DataView(array.buffer, array.byteOffset, array.byteLength);
}

/*
 Copyright (c) 2025 Gildas Lormeau. All rights reserved.

 Redistribution and use in source and binary forms, with or without
 modification, are permitted provided that the following conditions are met:

 1. Redistributions of source code must retain the above copyright notice,
 this list of conditions and the following disclaimer.

 2. Redistributions in binary form must reproduce the above copyright
 notice, this list of conditions and the following disclaimer in
 the documentation and/or other materials provided with the distribution.

 3. The names of the authors may not be used to endorse or promote products
 derived from this software without specific prior written permission.

 THIS SOFTWARE IS PROVIDED ''AS IS'' AND ANY EXPRESSED OR IMPLIED WARRANTIES,
 INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND
 FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL JCRAFT,
 INC. OR ANY CONTRIBUTORS TO THIS SOFTWARE BE LIABLE FOR ANY DIRECT, INDIRECT,
 INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA,
 OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
 LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
 EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */


const ERR_DUPLICATED_NAME = "File already exists";
const ERR_INVALID_COMMENT = "Zip file comment exceeds 64KB";
const ERR_INVALID_ENTRY_COMMENT = "File entry comment exceeds 64KB";
const ERR_INVALID_ENTRY_NAME = "File entry name exceeds 64KB";
const ERR_INVALID_VERSION = "Version exceeds 65535";
const ERR_INVALID_ENCRYPTION_STRENGTH = "The strength must equal 1, 2, or 3";
const ERR_INVALID_EXTRAFIELD_TYPE = "Extra field type exceeds 65535";
const ERR_INVALID_EXTRAFIELD_DATA = "Extra field data exceeds 64KB";
const ERR_UNSUPPORTED_COMPRESSION = "Compression method not supported";
const MIN_UNIX_TIME = -2147483648;
const MAX_UNIX_TIME = 2147483647;
const ERR_UNSUPPORTED_FORMAT = "Zip64 is not supported (set the 'zip64' option to 'true')";
const ERR_UNDEFINED_UNCOMPRESSED_SIZE = "Undefined uncompressed size";
const ERR_UNDEFINED_READER = "Undefined reader";
const ERR_ZIP_NOT_EMPTY = "Zip file not empty";
const ERR_INVALID_UID = "Invalid uid (must be integer 0..2^32-1)";
const ERR_INVALID_GID = "Invalid gid (must be integer 0..2^32-1)";
const ERR_INVALID_UNIX_MODE = "Invalid UNIX mode (must be integer 0..65535)";
const ERR_INVALID_UNIX_EXTRA_FIELD_TYPE = "Invalid unixExtraFieldType (must be 'infozip' or 'unix')";
const ERR_INVALID_UNIX_ID_SIZE = "uid/gid must be 0..65535 for unixExtraFieldType 'unix' (use 'infozip' for larger ids)";
const ERR_INVALID_MSDOS_ATTRIBUTES = "Invalid msdosAttributesRaw (must be integer 0..255)";
const ERR_INVALID_MSDOS_DATA = "Invalid msdosAttributes (must be an object with boolean flags)";

const EXTRAFIELD_DATA_AES = new Uint8Array([0x07, 0x00, 0x02, 0x00, 0x41, 0x45, 0x03, 0x00, 0x00]);
const INFOZIP_EXTRA_FIELD_TYPE = "infozip";
const UNIX_EXTRA_FIELD_TYPE = "unix";

let workers = 0;
const pendingEntries = [];

class ZipWriter {

	constructor(writer, options = {}) {
		writer = new GenericWriter(writer);
		const addSplitZipSignature =
			writer.availableSize !== UNDEFINED_VALUE && writer.availableSize > 0 && writer.availableSize !== INFINITY_VALUE &&
			writer.maxSize !== UNDEFINED_VALUE && writer.maxSize > 0 && writer.maxSize !== INFINITY_VALUE;
		Object.assign(this, {
			writer,
			addSplitZipSignature,
			options,
			config: getConfiguration(),
			files: new Map(),
			filenames: new Set(),
			offset: options[OPTION_OFFSET] === UNDEFINED_VALUE ? writer.size || writer.writable.size || 0 : options[OPTION_OFFSET],
			initialOffset: options[OPTION_OFFSET] === UNDEFINED_VALUE ? 0 : options[OPTION_OFFSET] - (writer.size || writer.writable.size || 0),
			pendingAddFileCalls: new Set(),
			bufferedWrites: 0,
			lastFileEntry: UNDEFINED_VALUE
		});
	}

	async prependZip(reader) {
		if (this.filenames.size) {
			throw new Error(ERR_ZIP_NOT_EMPTY);
		}
		reader = new GenericReader(reader);
		await initStream(reader);
		const zipReader = new ZipReader(reader.readable);
		const entries = await zipReader.getEntries();
		await zipReader.close();
		await initStream(this.writer);
		await reader.readable.pipeTo(this.writer.writable, { preventClose: true, preventAbort: true });
		this.writer.size = this.offset = reader.size;
		this.filenames = new Set(entries.map(entry => entry.filename));
		this.files = new Map(entries.map(entry => {
			const {
				version,
				rawLastModDate,
				lastAccessDate,
				creationDate,
				rawFilename,
				bitFlag,
				encrypted,
				uncompressedSize,
				compressedSize,
				diskOffset,
				diskNumber,
				zip64
			} = entry;
			let {
				compressionMethod,
				rawExtraFieldZip64,
				rawExtraFieldAES,
				rawExtraFieldExtendedTimestamp,
				rawExtraFieldNTFS,
				rawExtraFieldUnix,
				rawExtraField,
			} = entry;
			const { level, languageEncodingFlag, dataDescriptor } = bitFlag;
			rawExtraFieldZip64 = rawExtraFieldZip64 || EMPTY_UINT8_ARRAY;
			rawExtraFieldAES = rawExtraFieldAES || EMPTY_UINT8_ARRAY;
			rawExtraFieldExtendedTimestamp = rawExtraFieldExtendedTimestamp || EMPTY_UINT8_ARRAY;
			rawExtraFieldNTFS = rawExtraFieldNTFS || EMPTY_UINT8_ARRAY;
			rawExtraFieldUnix = rawExtraFieldUnix || EMPTY_UINT8_ARRAY;
			rawExtraField = rawExtraField || EMPTY_UINT8_ARRAY;
			if (entry.extraFieldAES) {
				compressionMethod = COMPRESSION_METHOD_AES;
			}
			const extraFieldLength = getLength(rawExtraFieldZip64, rawExtraFieldAES, rawExtraFieldExtendedTimestamp, rawExtraFieldNTFS, rawExtraFieldUnix, rawExtraField);
			const zip64UncompressedSize = zip64 && uncompressedSize >= MAX_32_BITS;
			const zip64CompressedSize = zip64 && compressedSize >= MAX_32_BITS;
			const bitFlagValue = (getBitFlag(level, languageEncodingFlag, dataDescriptor, encrypted, compressionMethod) & ~BITFLAG_LEVEL) | (level << 1);
			const {
				headerArray,
				headerView
			} = getHeaderArrayData({
				version,
				bitFlag: bitFlagValue,
				compressionMethod,
				uncompressedSize,
				compressedSize,
				rawLastModDate,
				rawFilename,
				zip64CompressedSize,
				zip64UncompressedSize,
				extraFieldLength
			});
			const { signature } = entry;
			if (signature !== UNDEFINED_VALUE) {
				setUint32(headerView, HEADER_OFFSET_SIGNATURE, signature);
			}
			Object.assign(entry, {
				zip64UncompressedSize,
				zip64CompressedSize,
				zip64Offset: zip64 && this.offset - diskOffset >= MAX_32_BITS,
				zip64DiskNumberStart: zip64 && diskNumber >= MAX_16_BITS,
				rawExtraFieldZip64,
				rawExtraFieldAES,
				rawExtraFieldExtendedTimestamp,
				rawExtraFieldNTFS,
				rawExtraFieldUnix,
				rawExtraField,
				extendedTimestamp: rawExtraFieldExtendedTimestamp.length > 0 || rawExtraFieldNTFS.length > 0,
				extraFieldExtendedTimestampFlag: 0x1 + (lastAccessDate ? 0x2 : 0) + (creationDate ? 0x4 : 0),
				headerArray,
				headerView
			});
			return [entry.filename, entry];
		}));
	}

	async add(name = "", reader, options = {}) {
		const zipWriter = this;
		options = Object.assign({}, options);
		const {
			pendingAddFileCalls,
			config
		} = zipWriter;
		if (workers < config.maxWorkers) {
			workers++;
		} else {
			await new Promise(resolve => pendingEntries.push(resolve));
		}
		let promiseAddFile;
		let nameAdded;
		try {
			name = name.trim();
			if (getOptionValue(zipWriter, options, PROPERTY_NAME_DIRECTORY) && !name.endsWith(DIRECTORY_SIGNATURE)) {
				name += DIRECTORY_SIGNATURE;
			}
			if (zipWriter.filenames.has(name)) {
				throw new Error(ERR_DUPLICATED_NAME);
			}
			zipWriter.filenames.add(name);
			nameAdded = true;
			promiseAddFile = addFile(zipWriter, name, reader, options);
			pendingAddFileCalls.add(promiseAddFile);
			return await promiseAddFile;
		} catch (error) {
			if (nameAdded) {
				zipWriter.filenames.delete(name);
			}
			throw error;
		} finally {
			pendingAddFileCalls.delete(promiseAddFile);
			const pendingEntry = pendingEntries.shift();
			if (pendingEntry) {
				pendingEntry();
			} else {
				workers--;
			}
		}
	}

	remove(entry) {
		const { filenames, files } = this;
		if (typeof entry == "string") {
			entry = files.get(entry);
		}
		if (entry && entry.filename !== UNDEFINED_VALUE) {
			const { filename } = entry;
			if (filenames.has(filename) && files.has(filename)) {
				filenames.delete(filename);
				files.delete(filename);
				return true;
			}
		}
		return false;
	}

	async close(comment = EMPTY_UINT8_ARRAY, options = {}) {
		const zipWriter = this;
		const { pendingAddFileCalls, writer } = this;
		const { writable } = writer;
		if (getLength(comment) > MAX_16_BITS) {
			throw new Error(ERR_INVALID_COMMENT);
		}
		while (pendingAddFileCalls.size) {
			await Promise.allSettled(Array.from(pendingAddFileCalls));
		}
		await closeFile(zipWriter, comment, options);
		const preventClose = getOptionValue(zipWriter, options, OPTION_PREVENT_CLOSE);
		if (!preventClose) {
			await writable.getWriter().close();
		}
		return writer.getData ? writer.getData() : writable;
	}
}

class ZipWriterStream {

	constructor(options = {}) {
		const { readable, writable } = new TransformStream();
		this.readable = readable;
		this.zipWriter = new ZipWriter(writable, options);
		this.pendingAddFileCalls = new Set();
	}

	transform(path) {
		const zipWriter = this.zipWriter;
		let streamController;
		const { readable, writable } = new TransformStream({
			start(controller) {
				streamController = controller;
			},
			flush: () => void closeArchive()
		});
		watchAddFileCall(this, this.zipWriter.add(path, readable), error => streamController.error(error));
		return { readable: this.readable, writable };

		async function closeArchive() {
			try {
				await zipWriter.close();
			} catch (error) {
				try {
					await zipWriter.writer.writable.abort(error);
				} catch {
					// ignored
				}
			}
		}
	}

	writable(path) {
		let streamController;
		const { readable, writable } = new TransformStream({
			start(controller) {
				streamController = controller;
			}
		});
		watchAddFileCall(this, this.zipWriter.add(path, readable), error => streamController.error(error));
		return writable;
	}

	async close(comment = UNDEFINED_VALUE, options = {}) {
		await Promise.all(Array.from(this.pendingAddFileCalls));
		return this.zipWriter.close(comment, options);
	}
}

function watchAddFileCall(zipWriterStream, promiseAddFile, onerror) {
	zipWriterStream.pendingAddFileCalls.add(promiseAddFile);
	promiseAddFile.catch(error => {
		try {
			onerror(error);
		} catch {
			// ignored
		}
	});
}

async function addFile(zipWriter, name, reader, options) {
	const attributesInfo = resolveAttributes(zipWriter, name, options);
	({ name } = attributesInfo);
	const metadataInfo = resolveMetadata(zipWriter, name, options);
	const { comment } = metadataInfo;
	const extraField = options[PROPERTY_NAME_EXTRA_FIELD];
	zipWriter.files.set(name, UNDEFINED_VALUE);
	let fileEntry;
	try {
		const sizesInfo = await resolveSizes(zipWriter, reader, metadataInfo, options);
		({ reader } = sizesInfo);
		const { diskOffset, diskNumber } = zipWriter.writer;
		options = Object.assign({}, options, attributesInfo.resolvedOptions, metadataInfo.resolvedOptions, sizesInfo.resolvedOptions, {
			internalFileAttribute: metadataInfo.resolvedOptions.internalFileAttributes,
			externalFileAttribute: attributesInfo.resolvedOptions.externalFileAttributes,
			signature: options[PROPERTY_NAME_SIGNATURE],
			offset: zipWriter.offset - diskOffset,
			diskNumberStart: diskNumber
		});
		const headerInfo = getHeaderInfo(options);
		const dataDescriptorInfo = getDataDescriptorInfo(options);
		const metadataSize = getLength(headerInfo.localHeaderArray, dataDescriptorInfo.dataDescriptorArray);
		fileEntry = await getFileEntry(zipWriter, name, reader, { headerInfo, dataDescriptorInfo, metadataSize }, options);
	} catch (error) {
		zipWriter.files.delete(name);
		throw error;
	}
	Object.assign(fileEntry, { name, comment, extraField });
	return new Entry(fileEntry);
}

function resolveAttributes(zipWriter, name, options) {
	name = name.trim();
	let msDosCompatible = getOptionValue(zipWriter, options, PROPERTY_NAME_MS_DOS_COMPATIBLE);
	let versionMadeBy = getOptionValue(zipWriter, options, PROPERTY_NAME_VERSION_MADE_BY, msDosCompatible ? 20 : 768);
	const executable = getOptionValue(zipWriter, options, PROPERTY_NAME_EXECUTABLE);
	const uid = getOptionValue(zipWriter, options, PROPERTY_NAME_UID);
	const gid = getOptionValue(zipWriter, options, PROPERTY_NAME_GID);
	let unixMode = getOptionValue(zipWriter, options, PROPERTY_NAME_UNIX_MODE);
	let unixExtraFieldType = getOptionValue(zipWriter, options, OPTION_UNIX_EXTRA_FIELD_TYPE);
	let setuid = getOptionValue(zipWriter, options, PROPERTY_NAME_SETUID);
	let setgid = getOptionValue(zipWriter, options, PROPERTY_NAME_SETGID);
	let sticky = getOptionValue(zipWriter, options, PROPERTY_NAME_STICKY);
	if (uid !== UNDEFINED_VALUE && (uid < 0 || uid > MAX_32_BITS)) {
		throw new Error(ERR_INVALID_UID);
	}
	if (gid !== UNDEFINED_VALUE && (gid < 0 || gid > MAX_32_BITS)) {
		throw new Error(ERR_INVALID_GID);
	}
	if (unixMode !== UNDEFINED_VALUE && (unixMode < 0 || unixMode > MAX_16_BITS)) {
		throw new Error(ERR_INVALID_UNIX_MODE);
	}
	if (unixExtraFieldType !== UNDEFINED_VALUE && unixExtraFieldType !== INFOZIP_EXTRA_FIELD_TYPE && unixExtraFieldType !== UNIX_EXTRA_FIELD_TYPE) {
		throw new Error(ERR_INVALID_UNIX_EXTRA_FIELD_TYPE);
	}
	if (unixExtraFieldType === UNIX_EXTRA_FIELD_TYPE &&
		((uid !== UNDEFINED_VALUE && uid > MAX_16_BITS) || (gid !== UNDEFINED_VALUE && gid > MAX_16_BITS))) {
		throw new Error(ERR_INVALID_UNIX_ID_SIZE);
	}
	if (unixExtraFieldType === UNDEFINED_VALUE && (uid !== UNDEFINED_VALUE || gid !== UNDEFINED_VALUE)) {
		unixExtraFieldType = INFOZIP_EXTRA_FIELD_TYPE;
	}
	let msdosAttributesRaw = getOptionValue(zipWriter, options, PROPERTY_NAME_MSDOS_ATTRIBUTES_RAW);
	let msdosAttributes = getOptionValue(zipWriter, options, PROPERTY_NAME_MSDOS_ATTRIBUTES);
	const hasUnixMetadata = uid !== UNDEFINED_VALUE || gid !== UNDEFINED_VALUE || unixMode !== UNDEFINED_VALUE || unixExtraFieldType;
	const hasMsDosProvided = msdosAttributesRaw !== UNDEFINED_VALUE || msdosAttributes !== UNDEFINED_VALUE;
	if (hasUnixMetadata) {
		msDosCompatible = false;
		versionMadeBy = (versionMadeBy & MAX_16_BITS) | (3 << 8);
	} else if (hasMsDosProvided) {
		msDosCompatible = true;
		versionMadeBy = (versionMadeBy & MAX_8_BITS);
	}
	if (msdosAttributesRaw !== UNDEFINED_VALUE && (msdosAttributesRaw < 0 || msdosAttributesRaw > MAX_8_BITS)) {
		throw new Error(ERR_INVALID_MSDOS_ATTRIBUTES);
	}
	if (msdosAttributes && typeof msdosAttributes !== OBJECT_TYPE) {
		throw new Error(ERR_INVALID_MSDOS_DATA);
	}
	if (versionMadeBy > MAX_16_BITS) {
		throw new Error(ERR_INVALID_VERSION);
	}
	let externalFileAttributes = getOptionValue(zipWriter, options, PROPERTY_NAME_EXTERNAL_FILE_ATTRIBUTES, 0);
	if (!options[PROPERTY_NAME_DIRECTORY] && name.endsWith(DIRECTORY_SIGNATURE)) {
		options[PROPERTY_NAME_DIRECTORY] = true;
	}
	const directory = getOptionValue(zipWriter, options, PROPERTY_NAME_DIRECTORY);
	if (directory) {
		if (!name.endsWith(DIRECTORY_SIGNATURE)) {
			name += DIRECTORY_SIGNATURE;
		}
		if (externalFileAttributes === 0) {
			externalFileAttributes = FILE_ATTR_MSDOS_DIR_MASK;
			if (!msDosCompatible) {
				externalFileAttributes |= (FILE_ATTR_UNIX_TYPE_DIR | FILE_ATTR_UNIX_EXECUTABLE_MASK | FILE_ATTR_UNIX_DEFAULT_MASK) << 16;
			}
		}
	} else if (!msDosCompatible && externalFileAttributes === 0) {
		if (executable) {
			externalFileAttributes = (FILE_ATTR_UNIX_EXECUTABLE_MASK | FILE_ATTR_UNIX_DEFAULT_MASK) << 16;
		} else {
			externalFileAttributes = FILE_ATTR_UNIX_DEFAULT_MASK << 16;
		}
	}
	let unixExternalUpper;
	if (!msDosCompatible) {
		unixExternalUpper = (externalFileAttributes >> 16) & MAX_16_BITS;
		unixMode = unixMode === UNDEFINED_VALUE ? unixExternalUpper : (unixMode & MAX_16_BITS);
		if (setuid) {
			unixMode |= FILE_ATTR_UNIX_SETUID_MASK;
		} else {
			setuid = Boolean(unixMode & FILE_ATTR_UNIX_SETUID_MASK);
		}
		if (setgid) {
			unixMode |= FILE_ATTR_UNIX_SETGID_MASK;
		} else {
			setgid = Boolean(unixMode & FILE_ATTR_UNIX_SETGID_MASK);
		}
		if (sticky) {
			unixMode |= FILE_ATTR_UNIX_STICKY_MASK;
		} else {
			sticky = Boolean(unixMode & FILE_ATTR_UNIX_STICKY_MASK);
		}
		if (directory) {
			unixMode |= FILE_ATTR_UNIX_TYPE_DIR;
		}
		externalFileAttributes = ((unixMode & MAX_16_BITS) << 16) | (externalFileAttributes & MAX_8_BITS);
	}
	({ msdosAttributesRaw, msdosAttributes } = normalizeMsdosAttributes(msdosAttributesRaw, msdosAttributes));
	if (hasMsDosProvided) {
		externalFileAttributes = (externalFileAttributes & MAX_32_BITS) | (msdosAttributesRaw & MAX_8_BITS);
	}
	return {
		name,
		resolvedOptions: {
			versionMadeBy,
			msDosCompatible,
			externalFileAttributes,
			unixExternalUpper,
			uid,
			gid,
			unixMode,
			unixExtraFieldType,
			setuid,
			setgid,
			sticky,
			msdosAttributesRaw,
			msdosAttributes
		}
	};
}

function resolveMetadata(zipWriter, name, options) {
	const encode = getOptionValue(zipWriter, options, OPTION_ENCODE_TEXT, encodeText);
	let rawFilename = encode(name);
	if (rawFilename === UNDEFINED_VALUE) {
		rawFilename = encodeText(name);
	}
	if (getLength(rawFilename) > MAX_16_BITS) {
		throw new Error(ERR_INVALID_ENTRY_NAME);
	}
	const comment = options[PROPERTY_NAME_COMMENT] || "";
	let rawComment = encode(comment);
	if (rawComment === UNDEFINED_VALUE) {
		rawComment = encodeText(comment);
	}
	if (getLength(rawComment) > MAX_16_BITS) {
		throw new Error(ERR_INVALID_ENTRY_COMMENT);
	}
	const version = getOptionValue(zipWriter, options, PROPERTY_NAME_VERSION, VERSION_DEFLATE);
	if (version > MAX_16_BITS) {
		throw new Error(ERR_INVALID_VERSION);
	}
	const lastModDate = getOptionValue(zipWriter, options, PROPERTY_NAME_LAST_MODIFICATION_DATE, new Date());
	const lastAccessDate = getOptionValue(zipWriter, options, PROPERTY_NAME_LAST_ACCESS_DATE);
	const creationDate = getOptionValue(zipWriter, options, PROPERTY_NAME_CREATION_DATE);
	const internalFileAttributes = getOptionValue(zipWriter, options, PROPERTY_NAME_INTERNAL_FILE_ATTRIBUTES, 0);
	const passThrough = getOptionValue(zipWriter, options, OPTION_PASS_THROUGH);
	let password, rawPassword;
	if (!passThrough) {
		password = getOptionValue(zipWriter, options, OPTION_PASSWORD);
		rawPassword = getOptionValue(zipWriter, options, OPTION_RAW_PASSWORD);
	}
	const encryptionStrength = getOptionValue(zipWriter, options, OPTION_ENCRYPTION_STRENGTH, 3);
	const zipCrypto = getOptionValue(zipWriter, options, PROPERTY_NAME_ZIPCRYPTO);
	const extendedTimestamp = getOptionValue(zipWriter, options, OPTION_EXTENDED_TIMESTAMP, true);
	const keepOrder = getOptionValue(zipWriter, options, OPTION_KEEP_ORDER, true);
	const useWebWorkers = getOptionValue(zipWriter, options, OPTION_USE_WEB_WORKERS);
	const transferStreams = getOptionValue(zipWriter, options, OPTION_TRANSFER_STREAMS, true);
	const bufferedWrite = getOptionValue(zipWriter, options, OPTION_BUFFERED_WRITE);
	const createTempStream = getOptionValue(zipWriter, options, OPTION_CREATE_TEMP_STREAM);
	const dataDescriptorSignature = getOptionValue(zipWriter, options, OPTION_DATA_DESCRIPTOR_SIGNATURE, true);
	const signal = getOptionValue(zipWriter, options, OPTION_SIGNAL);
	const useUnicodeFileNames = getOptionValue(zipWriter, options, OPTION_USE_UNICODE_FILE_NAMES, true);
	const compressionMethod = getOptionValue(zipWriter, options, PROPERTY_NAME_COMPRESSION_METHOD);
	if (!passThrough && compressionMethod !== UNDEFINED_VALUE &&
		compressionMethod !== COMPRESSION_METHOD_STORE && compressionMethod !== COMPRESSION_METHOD_DEFLATE) {
		throw new Error(ERR_UNSUPPORTED_COMPRESSION);
	}
	let level = getOptionValue(zipWriter, options, OPTION_LEVEL);
	let useCompressionStream = getOptionValue(zipWriter, options, OPTION_USE_COMPRESSION_STREAM);
	let dataDescriptor = getOptionValue(zipWriter, options, OPTION_DATA_DESCRIPTOR);
	if (bufferedWrite && dataDescriptor === UNDEFINED_VALUE) {
		dataDescriptor = false;
	}
	if (dataDescriptor === UNDEFINED_VALUE || zipCrypto) {
		dataDescriptor = true;
	}
	if (level !== UNDEFINED_VALUE && level != 6) {
		useCompressionStream = false;
	}
	if (!useCompressionStream && (zipWriter.config.CompressionStream === UNDEFINED_VALUE && zipWriter.config.CompressionStreamZlib === UNDEFINED_VALUE)) {
		level = 0;
	}
	const zip64 = getOptionValue(zipWriter, options, PROPERTY_NAME_ZIP64);
	if (!zipCrypto && (password !== UNDEFINED_VALUE || rawPassword !== UNDEFINED_VALUE) && !(encryptionStrength >= 1 && encryptionStrength <= 3)) {
		throw new Error(ERR_INVALID_ENCRYPTION_STRENGTH);
	}
	let rawExtraField = EMPTY_UINT8_ARRAY;
	const extraField = options[PROPERTY_NAME_EXTRA_FIELD];
	if (extraField) {
		let extraFieldSize = 0;
		let offset = 0;
		extraField.forEach(data => extraFieldSize += 4 + getLength(data));
		rawExtraField = new Uint8Array(extraFieldSize);
		const rawExtraFieldView = getDataView(rawExtraField);
		extraField.forEach((data, type) => {
			if (type > MAX_16_BITS) {
				throw new Error(ERR_INVALID_EXTRAFIELD_TYPE);
			}
			if (getLength(data) > MAX_16_BITS) {
				throw new Error(ERR_INVALID_EXTRAFIELD_DATA);
			}
			setUint16(rawExtraFieldView, offset, type);
			setUint16(rawExtraFieldView, offset + 2, getLength(data));
			arraySet(rawExtraField, data, offset + 4);
			offset += 4 + getLength(data);
		});
	}
	return {
		comment,
		resolvedOptions: {
			rawFilename,
			rawComment,
			version,
			lastModDate,
			lastAccessDate,
			creationDate,
			internalFileAttributes,
			passThrough,
			password,
			rawPassword,
			encryptionStrength,
			zipCrypto,
			extendedTimestamp,
			keepOrder,
			useWebWorkers,
			transferStreams,
			bufferedWrite,
			createTempStream,
			dataDescriptorSignature,
			signal,
			useUnicodeFileNames,
			compressionMethod,
			level,
			useCompressionStream,
			dataDescriptor,
			zip64,
			rawExtraField
		}
	};
}

async function resolveSizes(zipWriter, reader, { resolvedOptions: metadata }, options) {
	const { passThrough, zipCrypto, password, rawPassword, encryptionStrength } = metadata;
	let { dataDescriptor, zip64, level, compressionMethod } = metadata;
	let maximumCompressedSize = 0;
	let uncompressedSize = 0;
	if (passThrough) {
		if (!reader) {
			throw new Error(ERR_UNDEFINED_READER);
		}
		uncompressedSize = options[PROPERTY_NAME_UNCOMPRESSED_SIZE];
		if (uncompressedSize === UNDEFINED_VALUE) {
			throw new Error(ERR_UNDEFINED_UNCOMPRESSED_SIZE);
		}
	}
	const zip64Enabled = zip64 === true;
	const encrypted = getOptionValue(zipWriter, options, PROPERTY_NAME_ENCRYPTED);
	const encryptedEntry = Boolean(reader) && (Boolean((password && getLength(password)) || (rawPassword && getLength(rawPassword))) || (passThrough && encrypted));
	if (!reader) {
		level = 0;
		compressionMethod = COMPRESSION_METHOD_STORE;
	}
	const encryptionOverhead = encryptedEntry ? (zipCrypto ? 12 : 16 + encryptionStrength * 4) : 0;
	if (reader) {
		reader = new GenericReader(reader);
		await initStream(reader);
		if (!passThrough) {
			if (reader.size === UNDEFINED_VALUE) {
				dataDescriptor = true;
				if (zip64 || zip64 === UNDEFINED_VALUE) {
					zip64 = true;
					uncompressedSize = maximumCompressedSize = MAX_32_BITS + 1;
				}
			} else {
				options.uncompressedSize = uncompressedSize = reader.size;
				maximumCompressedSize = getMaximumCompressedSize(uncompressedSize) + encryptionOverhead;
			}
		} else {
			options.uncompressedSize = uncompressedSize;
			maximumCompressedSize = getMaximumCompressedSize(uncompressedSize) + encryptionOverhead;
		}
	}
	const zip64UncompressedSize = zip64Enabled || uncompressedSize >= MAX_32_BITS;
	const zip64CompressedSize = zip64Enabled || maximumCompressedSize >= MAX_32_BITS;
	if (zip64UncompressedSize || zip64CompressedSize) {
		if (zip64 === false) {
			throw new Error(ERR_UNSUPPORTED_FORMAT);
		} else {
			zip64 = true;
		}
	}
	zip64 = zip64 || false;
	return {
		reader,
		resolvedOptions: {
			dataDescriptor,
			zip64,
			zip64UncompressedSize,
			zip64CompressedSize,
			uncompressedSize,
			level,
			compressionMethod,
			encrypted: encryptedEntry
		}
	};
}

async function getFileEntry(zipWriter, name, reader, entryInfo, options) {
	const {
		files,
		writer
	} = zipWriter;
	const {
		keepOrder,
		dataDescriptor,
		signal
	} = options;
	const {
		headerInfo
	} = entryInfo;
	const usdz = zipWriter.options[OPTION_USDZ];
	const previousFileEntry = zipWriter.lastFileEntry;
	let fileEntry = {};
	let bufferedWrite;
	let releaseLockWriter;
	let releaseLockCurrentFileEntry;
	let writingBufferedEntryData;
	let writingEntryData;
	let writerSizeBeforeEntry;
	let flushedBufferedSize = 0;
	let fileWriter;
	files.set(name, fileEntry);
	zipWriter.lastFileEntry = fileEntry;
	try {
		let lockPreviousFileEntry;
		if (keepOrder) {
			lockPreviousFileEntry = previousFileEntry && previousFileEntry.lock;
			requestLockCurrentFileEntry();
		}
		if (options.bufferedWrite || !keepOrder || zipWriter.writerLocked || zipWriter.bufferedWrites || !dataDescriptor) {
			bufferedWrite = true;
			zipWriter.bufferedWrites++;
			if (options.createTempStream) {
				fileWriter = await options.createTempStream();
			} else {
				fileWriter = new TransformStream(UNDEFINED_VALUE, UNDEFINED_VALUE, { highWaterMark: INFINITY_VALUE });
			}
			fileWriter.size = 0;
			await initStream(writer);
		} else {
			fileWriter = writer;
			await requestLockWriter();
		}
		await initStream(fileWriter);
		const { diskOffset } = writer;
		if (zipWriter.addSplitZipSignature) {
			delete zipWriter.addSplitZipSignature;
			const signatureArray = new Uint8Array(4);
			const signatureArrayView = getDataView(signatureArray);
			setUint32(signatureArrayView, 0, SPLIT_ZIP_FILE_SIGNATURE);
			await writeData(writer, signatureArray);
			zipWriter.offset += 4;
		}
		if (usdz && !bufferedWrite) {
			appendExtraFieldUSDZ(entryInfo, zipWriter.offset - diskOffset);
		}
		const { localHeaderArray } = headerInfo;
		if (!bufferedWrite) {
			await lockPreviousFileEntry;
			await skipDiskIfNeeded();
		}
		const diskNumberStart = writer.diskNumber;
		const entryOffset = getSegmentOffset(zipWriter, writer);
		fileEntry.diskNumberStart = diskNumberStart;
		if (!bufferedWrite) {
			writingEntryData = true;
			writerSizeBeforeEntry = writer.size;
			await writeData(fileWriter, localHeaderArray);
		}
		fileEntry = await createFileEntry(reader, fileWriter, fileEntry, entryInfo, zipWriter.config, options);
		if (!bufferedWrite) {
			writingEntryData = false;
		}
		files.set(name, fileEntry);
		fileEntry.filename = name;
		if (bufferedWrite) {
			await Promise.all([fileWriter.writable.getWriter().close(), lockPreviousFileEntry]);
			await requestLockWriter();
			writingBufferedEntryData = true;
			writerSizeBeforeEntry = writer.size;
			await skipDiskIfNeeded();
			fileEntry.diskNumberStart = writer.diskNumber;
			fileEntry.offset = getSegmentOffset(zipWriter, writer);
			if (usdz) {
				const previousMetadataSize = entryInfo.metadataSize;
				appendExtraFieldUSDZ(entryInfo, zipWriter.offset - writer.diskOffset);
				fileEntry.size += entryInfo.metadataSize - previousMetadataSize;
			}
			updateLocalHeader(fileEntry, headerInfo.localHeaderView, options);
			await writeData(writer, headerInfo.localHeaderArray);
			await flushBufferedData(fileWriter.readable, writer, signal, chunkLength => flushedBufferedSize += chunkLength);
			writer.size += fileWriter.size;
			writingBufferedEntryData = false;
		} else {
			fileEntry.diskNumberStart = diskNumberStart;
			fileEntry.offset = entryOffset;
		}
		zipWriter.offset += fileEntry.size;
		return fileEntry;
	} catch (error) {
		if (writingBufferedEntryData || writingEntryData) {
			zipWriter.hasCorruptedEntries = true;
			if (error) {
				try {
					error.corruptedEntry = true;
				} catch {
					// ignored
				}
			}
			zipWriter.offset += writer.size - writerSizeBeforeEntry;
			if (bufferedWrite) {
				zipWriter.offset += flushedBufferedSize;
			}
		}
		files.delete(name);
		throw error;
	} finally {
		if (bufferedWrite) {
			zipWriter.bufferedWrites--;
		}
		if (releaseLockCurrentFileEntry) {
			releaseLockCurrentFileEntry();
		}
		if (releaseLockWriter) {
			releaseLockWriter();
		}
		if (bufferedWrite && fileWriter && fileWriter.dispose) {
			try {
				await fileWriter.dispose();
			} catch {
				// ignored
			}
		}
	}

	function requestLockCurrentFileEntry() {
		fileEntry.lock = new Promise(resolve => releaseLockCurrentFileEntry = resolve);
	}

	async function requestLockWriter() {
		zipWriter.writerLocked = true;
		const { lockWriter } = zipWriter;
		zipWriter.lockWriter = new Promise(resolve => releaseLockWriter = () => {
			zipWriter.writerLocked = false;
			resolve();
		});
		await lockWriter;
	}

	async function skipDiskIfNeeded() {
		if (getLength(headerInfo.localHeaderArray) > writer.availableSize) {
			writer.availableSize = 0;
			await writeData(writer, EMPTY_UINT8_ARRAY);
		}
	}
}

async function createFileEntry(reader, writer, { diskNumberStart, lock }, entryInfo, config, options) {
	const {
		headerInfo,
		dataDescriptorInfo,
		metadataSize
	} = entryInfo;
	const {
		headerArray,
		headerView,
		lastModDate,
		rawLastModDate,
		encrypted,
		compressed,
		version,
		compressionMethod,
		rawExtraFieldZip64,
		localExtraFieldZip64Length,
		rawExtraFieldExtendedTimestamp,
		extraFieldExtendedTimestampFlag,
		rawExtraFieldNTFS,
		rawExtraFieldUnix,
		rawExtraFieldAES,
	} = headerInfo;
	const { dataDescriptorArray } = dataDescriptorInfo;
	const {
		rawFilename,
		lastAccessDate,
		creationDate,
		password,
		rawPassword,
		level,
		zip64,
		zip64UncompressedSize,
		zip64CompressedSize,
		zipCrypto,
		dataDescriptor,
		directory,
		executable,
		versionMadeBy,
		rawComment,
		rawExtraField,
		useWebWorkers,
		transferStreams,
		onstart,
		onprogress,
		onend,
		signal,
		encryptionStrength,
		extendedTimestamp,
		msDosCompatible,
		internalFileAttributes,
		externalFileAttributes,
		uid,
		gid,
		unixMode,
		setuid,
		setgid,
		sticky,
		unixExternalUpper,
		msdosAttributesRaw,
		msdosAttributes,
		useCompressionStream,
		passThrough
	} = options;
	const fileEntry = {
		lock,
		versionMadeBy,
		zip64,
		directory: Boolean(directory),
		executable: Boolean(executable),
		filenameUTF8: true,
		rawFilename,
		commentUTF8: true,
		rawComment,
		rawExtraFieldZip64,
		localExtraFieldZip64Length,
		rawExtraFieldExtendedTimestamp,
		rawExtraFieldNTFS,
		rawExtraFieldUnix,
		rawExtraFieldAES,
		rawExtraField,
		extendedTimestamp,
		msDosCompatible,
		internalFileAttributes,
		externalFileAttributes,
		diskNumberStart,
		uid,
		gid,
		unixMode,
		setuid,
		setgid,
		sticky,
		unixExternalUpper,
		msdosAttributesRaw,
		msdosAttributes
	};
	let {
		signature,
		uncompressedSize
	} = options;
	let compressedSize = 0;
	if (!passThrough) {
		uncompressedSize = 0;
	}
	const { writable } = writer;
	if (reader) {
		const readable = reader.createReadable ? reader.createReadable({ chunkSize: getChunkSize(config) }) : reader.readable;
		const size = reader.size;
		const workerOptions = {
			options: {
				codecType: CODEC_DEFLATE,
				level,
				rawPassword,
				password,
				encryptionStrength,
				zipCrypto: encrypted && zipCrypto,
				passwordVerification: encrypted && zipCrypto && (rawLastModDate >> 8) & MAX_8_BITS,
				signed: !passThrough,
				compressed: compressed && !passThrough,
				encrypted: encrypted && !passThrough,
				useWebWorkers,
				useCompressionStream,
				transferStreams
			},
			config,
			streamOptions: { signal, size, onstart, onprogress, onend }
		};
		try {
			const result = await runWorker({ readable, writable }, workerOptions);
			compressedSize = result.outputSize;
			writer.size += compressedSize;
			if (!passThrough) {
				uncompressedSize = result.inputSize;
				signature = result.signature;
			}
			if ((!zip64CompressedSize && compressedSize >= MAX_32_BITS) ||
				(!zip64UncompressedSize && uncompressedSize >= MAX_32_BITS)) {
				throw new Error(ERR_UNSUPPORTED_FORMAT);
			}
		} catch (error) {
			if (error.outputSize !== UNDEFINED_VALUE) {
				writer.size += error.outputSize;
			}
			throw error;
		}

	}
	setEntryInfo({
		signature,
		compressedSize,
		uncompressedSize,
		headerInfo,
		dataDescriptorInfo
	}, options);
	if (dataDescriptor) {
		await writeData(writer, dataDescriptorArray);
	}
	Object.assign(fileEntry, {
		uncompressedSize,
		compressedSize,
		lastModDate,
		rawLastModDate,
		creationDate,
		lastAccessDate,
		encrypted,
		zipCrypto,
		size: metadataSize + compressedSize,
		compressionMethod,
		version,
		headerArray,
		headerView,
		signature,
		extraFieldExtendedTimestampFlag,
		zip64UncompressedSize,
		zip64CompressedSize
	});
	return fileEntry;
}

function getHeaderInfo(options) {
	const {
		rawFilename,
		lastModDate,
		lastAccessDate,
		creationDate,
		level,
		zip64,
		zipCrypto,
		useUnicodeFileNames,
		dataDescriptor,
		directory,
		rawExtraField,
		encryptionStrength,
		extendedTimestamp,
		passThrough,
		encrypted,
		zip64UncompressedSize,
		zip64CompressedSize,
		uncompressedSize
	} = options;
	let { version, compressionMethod } = options;
	const compressed = !directory && (compressionMethod === UNDEFINED_VALUE
		? (level === UNDEFINED_VALUE || level > 0)
		: compressionMethod !== COMPRESSION_METHOD_STORE);
	let rawLocalExtraFieldZip64;
	const uncompressedFile = passThrough || !compressed;
	const zip64ExtraFieldComplete = zip64 && (options.bufferedWrite || !dataDescriptor || ((!zip64UncompressedSize && !zip64CompressedSize) || uncompressedFile));
	const writeLocalExtraFieldZip64 = zip64ExtraFieldComplete || (zip64 && dataDescriptor && (zip64UncompressedSize || zip64CompressedSize));
	if (zip64 && (zip64UncompressedSize || zip64CompressedSize)) {
		const length = 4 + 16;
		const extraFieldZip64 = createRecordWriter(length);
		extraFieldZip64.uint16(EXTRAFIELD_TYPE_ZIP64);
		extraFieldZip64.uint16(length - 4);
		rawLocalExtraFieldZip64 = extraFieldZip64.array;
		if (zip64ExtraFieldComplete) {
			extraFieldZip64.uint64(uncompressedSize);
			if (uncompressedFile) {
				const encryptionOverhead = encrypted ? (zipCrypto ? 12 : 16 + encryptionStrength * 4) : 0;
				extraFieldZip64.uint64(passThrough ? 0 : uncompressedSize + encryptionOverhead);
			}
		}
	} else {
		rawLocalExtraFieldZip64 = EMPTY_UINT8_ARRAY;
	}
	let rawExtraFieldAES;
	if (encrypted && !zipCrypto) {
		const extraFieldAES = createRecordWriter(getLength(EXTRAFIELD_DATA_AES) + 2);
		extraFieldAES.uint16(EXTRAFIELD_TYPE_AES);
		extraFieldAES.bytes(EXTRAFIELD_DATA_AES);
		rawExtraFieldAES = extraFieldAES.array;
		rawExtraFieldAES[8] = encryptionStrength;
	} else {
		rawExtraFieldAES = EMPTY_UINT8_ARRAY;
	}
	let rawExtraFieldNTFS;
	let rawExtraFieldExtendedTimestamp;
	let extraFieldExtendedTimestampFlag;
	if (extendedTimestamp) {
		const lastModTimeUnix = getTimeUnix(lastModDate);
		if (inUnixTimeRange(lastModTimeUnix)) {
			const extraFieldTimestampLength = 9 + (lastAccessDate ? 4 : 0) + (creationDate ? 4 : 0);
			const extraFieldTimestamp = createRecordWriter(extraFieldTimestampLength);
			extraFieldExtendedTimestampFlag = 0x1 + (lastAccessDate ? 0x2 : 0) + (creationDate ? 0x4 : 0);
			extraFieldTimestamp.uint16(EXTRAFIELD_TYPE_EXTENDED_TIMESTAMP);
			extraFieldTimestamp.uint16(extraFieldTimestampLength - 4);
			extraFieldTimestamp.uint8(extraFieldExtendedTimestampFlag);
			extraFieldTimestamp.uint32(lastModTimeUnix);
			if (lastAccessDate) {
				extraFieldTimestamp.uint32(clampUnixTime(getTimeUnix(lastAccessDate)));
			}
			if (creationDate) {
				extraFieldTimestamp.uint32(clampUnixTime(getTimeUnix(creationDate)));
			}
			rawExtraFieldExtendedTimestamp = extraFieldTimestamp.array;
		} else {
			rawExtraFieldExtendedTimestamp = EMPTY_UINT8_ARRAY;
		}
		try {
			const lastModTimeNTFS = getTimeNTFS(lastModDate);
			const extraFieldNTFS = createRecordWriter(36);
			extraFieldNTFS.uint16(EXTRAFIELD_TYPE_NTFS);
			extraFieldNTFS.uint16(32);
			extraFieldNTFS.skip(4);
			extraFieldNTFS.uint16(EXTRAFIELD_TYPE_NTFS_TAG1);
			extraFieldNTFS.uint16(24);
			extraFieldNTFS.uint64(lastModTimeNTFS);
			extraFieldNTFS.uint64(getTimeNTFS(lastAccessDate) || lastModTimeNTFS);
			extraFieldNTFS.uint64(getTimeNTFS(creationDate) || lastModTimeNTFS);
			rawExtraFieldNTFS = extraFieldNTFS.array;
		} catch {
			rawExtraFieldNTFS = EMPTY_UINT8_ARRAY;
		}
	} else {
		rawExtraFieldNTFS = rawExtraFieldExtendedTimestamp = EMPTY_UINT8_ARRAY;
	}
	let rawExtraFieldUnix;
	try {
		const { uid, gid, unixExtraFieldType } = options;
		if (unixExtraFieldType == INFOZIP_EXTRA_FIELD_TYPE && (uid !== UNDEFINED_VALUE || gid !== UNDEFINED_VALUE)) {
			const uidBytes = packUnixId(uid);
			const gidBytes = packUnixId(gid);
			const payloadLength = 3 + uidBytes.length + gidBytes.length;
			const extraFieldUnix = createRecordWriter(4 + payloadLength);
			extraFieldUnix.uint16(EXTRAFIELD_TYPE_INFOZIP);
			extraFieldUnix.uint16(payloadLength);
			extraFieldUnix.uint8(1);
			extraFieldUnix.uint8(uidBytes.length);
			extraFieldUnix.bytes(uidBytes);
			extraFieldUnix.uint8(gidBytes.length);
			extraFieldUnix.bytes(gidBytes);
			rawExtraFieldUnix = extraFieldUnix.array;
		} else if (unixExtraFieldType == UNIX_EXTRA_FIELD_TYPE && (uid !== UNDEFINED_VALUE || gid !== UNDEFINED_VALUE)) {
			const extraFieldUnix = createRecordWriter(8);
			extraFieldUnix.uint16(EXTRAFIELD_TYPE_UNIX);
			extraFieldUnix.uint16(4);
			extraFieldUnix.uint16((uid === UNDEFINED_VALUE ? 0 : uid) & MAX_16_BITS);
			extraFieldUnix.uint16((gid === UNDEFINED_VALUE ? 0 : gid) & MAX_16_BITS);
			rawExtraFieldUnix = extraFieldUnix.array;
		} else {
			rawExtraFieldUnix = EMPTY_UINT8_ARRAY;
		}
	} catch {
		rawExtraFieldUnix = EMPTY_UINT8_ARRAY;
	}
	if (compressionMethod === UNDEFINED_VALUE) {
		compressionMethod = compressed ? COMPRESSION_METHOD_DEFLATE : COMPRESSION_METHOD_STORE;
	}
	if (zip64) {
		version = version > VERSION_ZIP64 ? version : VERSION_ZIP64;
	}
	if (encrypted && !zipCrypto) {
		version = version > VERSION_AES ? version : VERSION_AES;
		rawExtraFieldAES[9] = compressionMethod;
		compressionMethod = COMPRESSION_METHOD_AES;
	}
	const localExtraFieldZip64Length = writeLocalExtraFieldZip64 ? getLength(rawLocalExtraFieldZip64) : 0;
	const extraFieldLength = localExtraFieldZip64Length + getLength(rawExtraFieldAES, rawExtraFieldExtendedTimestamp, rawExtraFieldNTFS, rawExtraFieldUnix, rawExtraField);
	if (extraFieldLength > MAX_16_BITS) {
		throw new Error(ERR_INVALID_EXTRAFIELD_DATA);
	}
	const {
		headerArray,
		headerView,
		rawLastModDate
	} = getHeaderArrayData({
		version,
		bitFlag: getBitFlag(level, useUnicodeFileNames, dataDescriptor, encrypted, compressionMethod),
		compressionMethod,
		uncompressedSize,
		lastModDate: lastModDate < MIN_DATE ? MIN_DATE : lastModDate > MAX_DATE ? MAX_DATE : lastModDate,
		rawFilename,
		zip64CompressedSize,
		zip64UncompressedSize,
		extraFieldLength
	});
	const localHeader = createRecordWriter(HEADER_SIZE + getLength(rawFilename) + extraFieldLength);
	const localHeaderArray = localHeader.array;
	const localHeaderView = getDataView(localHeaderArray);
	localHeader.uint32(LOCAL_FILE_HEADER_SIGNATURE);
	localHeader.bytes(headerArray);
	localHeader.bytes(rawFilename);
	if (writeLocalExtraFieldZip64) {
		localHeader.bytes(rawLocalExtraFieldZip64);
	}
	localHeader.bytes(rawExtraFieldAES);
	localHeader.bytes(rawExtraFieldExtendedTimestamp);
	localHeader.bytes(rawExtraFieldNTFS);
	localHeader.bytes(rawExtraFieldUnix);
	localHeader.bytes(rawExtraField);
	if (dataDescriptor) {
		if (!zip64CompressedSize) {
			setUint32(localHeaderView, HEADER_OFFSET_COMPRESSED_SIZE + LOCAL_HEADER_COMMON_OFFSET, 0);
		}
		if (!zip64UncompressedSize) {
			setUint32(localHeaderView, HEADER_OFFSET_UNCOMPRESSED_SIZE + LOCAL_HEADER_COMMON_OFFSET, 0);
		}
	}
	return {
		localHeaderArray,
		localHeaderView,
		headerArray,
		headerView,
		lastModDate,
		rawLastModDate,
		encrypted,
		compressed,
		version,
		compressionMethod,
		extraFieldExtendedTimestampFlag,
		rawExtraFieldZip64: EMPTY_UINT8_ARRAY,
		localExtraFieldZip64Length,
		rawExtraFieldExtendedTimestamp,
		rawExtraFieldNTFS,
		rawExtraFieldUnix,
		rawExtraFieldAES,
		extraFieldLength
	};
}

function appendExtraFieldUSDZ(entryInfo, zipWriterOffset) {
	const { headerInfo } = entryInfo;
	let { localHeaderArray, extraFieldLength } = headerInfo;
	let extraBytesLength = 64 - ((zipWriterOffset + getLength(localHeaderArray)) % 64);
	if (extraBytesLength < 4) {
		extraBytesLength += 64;
	}
	const rawExtraFieldUSDZ = new Uint8Array(extraBytesLength);
	const extraFieldUSDZView = getDataView(rawExtraFieldUSDZ);
	setUint16(extraFieldUSDZView, 0, EXTRAFIELD_TYPE_USDZ);
	setUint16(extraFieldUSDZView, 2, extraBytesLength - 4);
	const previousLocalHeaderArray = localHeaderArray;
	headerInfo.localHeaderArray = localHeaderArray = new Uint8Array(getLength(previousLocalHeaderArray) + extraBytesLength);
	arraySet(localHeaderArray, previousLocalHeaderArray);
	arraySet(localHeaderArray, rawExtraFieldUSDZ, getLength(previousLocalHeaderArray));
	const localHeaderArrayView = getDataView(localHeaderArray);
	setUint16(localHeaderArrayView, 28, extraFieldLength + extraBytesLength);
	headerInfo.localHeaderView = localHeaderArrayView;
	entryInfo.metadataSize += extraBytesLength;
}

function packUnixId(id) {
	if (id === UNDEFINED_VALUE) {
		return EMPTY_UINT8_ARRAY;
	} else {
		const dataArray = new Uint8Array(4);
		const dataView = getDataView(dataArray);
		dataView.setUint32(0, id, true);
		let length = 4;
		while (length > 1 && dataArray[length - 1] === 0) {
			length--;
		}
		return dataArray.subarray(0, length);
	}
}

function normalizeMsdosAttributes(msdosAttributesRaw, msdosAttributes) {
	if (msdosAttributesRaw !== UNDEFINED_VALUE) {
		msdosAttributesRaw = msdosAttributesRaw & MAX_8_BITS;
	} else if (msdosAttributes !== UNDEFINED_VALUE) {
		const { readOnly, hidden, system, directory: msdDir, archive } = msdosAttributes;
		let raw = 0;
		if (readOnly) raw |= FILE_ATTR_MSDOS_READONLY_MASK;
		if (hidden) raw |= FILE_ATTR_MSDOS_HIDDEN_MASK;
		if (system) raw |= FILE_ATTR_MSDOS_SYSTEM_MASK;
		if (msdDir) raw |= FILE_ATTR_MSDOS_DIR_MASK;
		if (archive) raw |= FILE_ATTR_MSDOS_ARCHIVE_MASK;
		msdosAttributesRaw = raw & MAX_8_BITS;
	}
	if (msdosAttributes === UNDEFINED_VALUE) {
		msdosAttributes = {
			readOnly: Boolean(msdosAttributesRaw & FILE_ATTR_MSDOS_READONLY_MASK),
			hidden: Boolean(msdosAttributesRaw & FILE_ATTR_MSDOS_HIDDEN_MASK),
			system: Boolean(msdosAttributesRaw & FILE_ATTR_MSDOS_SYSTEM_MASK),
			directory: Boolean(msdosAttributesRaw & FILE_ATTR_MSDOS_DIR_MASK),
			archive: Boolean(msdosAttributesRaw & FILE_ATTR_MSDOS_ARCHIVE_MASK)
		};
	}
	return { msdosAttributesRaw, msdosAttributes };
}

function getDataDescriptorInfo({
	zip64,
	dataDescriptor,
	dataDescriptorSignature
}) {
	let dataDescriptorArray = EMPTY_UINT8_ARRAY;
	let dataDescriptorView, dataDescriptorOffset = 0;
	let dataDescriptorLength = zip64 ? DATA_DESCRIPTOR_RECORD_ZIP_64_LENGTH : DATA_DESCRIPTOR_RECORD_LENGTH;
	if (dataDescriptorSignature) {
		dataDescriptorLength += DATA_DESCRIPTOR_RECORD_SIGNATURE_LENGTH;
	}
	if (dataDescriptor) {
		dataDescriptorArray = new Uint8Array(dataDescriptorLength);
		dataDescriptorView = getDataView(dataDescriptorArray);
		if (dataDescriptorSignature) {
			dataDescriptorOffset = DATA_DESCRIPTOR_RECORD_SIGNATURE_LENGTH;
			setUint32(dataDescriptorView, 0, DATA_DESCRIPTOR_RECORD_SIGNATURE);
		}
	}
	return {
		dataDescriptorArray,
		dataDescriptorView,
		dataDescriptorOffset
	};
}

function setEntryInfo({
	signature,
	compressedSize,
	uncompressedSize,
	headerInfo,
	dataDescriptorInfo
}, {
	zip64,
	zipCrypto,
	dataDescriptor
}) {
	const {
		headerView,
		encrypted
	} = headerInfo;
	const {
		dataDescriptorView,
		dataDescriptorOffset
	} = dataDescriptorInfo;
	if ((!encrypted || zipCrypto) && signature !== UNDEFINED_VALUE) {
		setUint32(headerView, HEADER_OFFSET_SIGNATURE, signature);
		if (dataDescriptor) {
			setUint32(dataDescriptorView, dataDescriptorOffset, signature);
		}
	}
	if (zip64) {
		if (dataDescriptor) {
			setBigUint64(dataDescriptorView, dataDescriptorOffset + 4, BigInt(compressedSize));
			setBigUint64(dataDescriptorView, dataDescriptorOffset + 12, BigInt(uncompressedSize));
		}
	} else {
		setUint32(headerView, HEADER_OFFSET_COMPRESSED_SIZE, compressedSize);
		setUint32(headerView, HEADER_OFFSET_UNCOMPRESSED_SIZE, uncompressedSize);
		if (dataDescriptor) {
			setUint32(dataDescriptorView, dataDescriptorOffset + 4, compressedSize);
			setUint32(dataDescriptorView, dataDescriptorOffset + 8, uncompressedSize);
		}
	}
}

function updateLocalHeader({
	rawFilename,
	encrypted,
	zip64,
	localExtraFieldZip64Length,
	signature,
	compressedSize,
	uncompressedSize,
	zip64UncompressedSize,
	zip64CompressedSize
}, localHeaderView, { dataDescriptor }) {
	if (!dataDescriptor) {
		if (!encrypted) {
			setUint32(localHeaderView, HEADER_OFFSET_SIGNATURE + LOCAL_HEADER_COMMON_OFFSET, signature);
		}
		if (!zip64CompressedSize) {
			setUint32(localHeaderView, HEADER_OFFSET_COMPRESSED_SIZE + LOCAL_HEADER_COMMON_OFFSET, compressedSize);
		}
		if (!zip64UncompressedSize) {
			setUint32(localHeaderView, HEADER_OFFSET_UNCOMPRESSED_SIZE + LOCAL_HEADER_COMMON_OFFSET, uncompressedSize);
		}
	}
	if (zip64 && localExtraFieldZip64Length) {
		const localHeaderOffset = HEADER_SIZE + getLength(rawFilename) + 4;
		setBigUint64(localHeaderView, localHeaderOffset, BigInt(uncompressedSize));
		setBigUint64(localHeaderView, localHeaderOffset + 8, BigInt(compressedSize));
	}
}


async function closeFile(zipWriter, comment, options) {
	const directoryDataLength = createDirectoryRecords(zipWriter.files);
	const { cdStartDiskNumber, cdStartDiskOffset } = await writeDirectoryRecords(zipWriter, directoryDataLength, options);
	await writeEndOfDirectoryRecord(zipWriter, comment, options, { cdStartDiskNumber, cdStartDiskOffset, directoryDataLength });
}

function createDirectoryRecords(files) {
	let directoryDataLength = 0;
	for (const [, fileEntry] of files) {
		const {
			rawFilename,
			rawExtraFieldAES,
			rawComment,
			rawExtraFieldNTFS,
			rawExtraFieldUnix,
			rawExtraField,
			extendedTimestamp,
			extraFieldExtendedTimestampFlag,
			lastModDate,
			zip64UncompressedSize,
			zip64CompressedSize,
			uncompressedSize,
			compressedSize
		} = fileEntry;
		const zip64Offset = fileEntry.offset >= MAX_32_BITS;
		const zip64DiskNumberStart = fileEntry.diskNumberStart >= MAX_16_BITS;
		let rawExtraFieldZip64;
		if (zip64Offset || zip64DiskNumberStart || zip64UncompressedSize || zip64CompressedSize) {
			const length = 4 + (zip64UncompressedSize ? 8 : 0) + (zip64CompressedSize ? 8 : 0) + (zip64Offset ? 8 : 0) + (zip64DiskNumberStart ? 4 : 0);
			const extraFieldZip64 = createRecordWriter(length);
			extraFieldZip64.uint16(EXTRAFIELD_TYPE_ZIP64);
			extraFieldZip64.uint16(length - 4);
			if (zip64UncompressedSize) {
				extraFieldZip64.uint64(uncompressedSize);
			}
			if (zip64CompressedSize) {
				extraFieldZip64.uint64(compressedSize);
			}
			if (zip64Offset) {
				extraFieldZip64.uint64(fileEntry.offset);
			}
			if (zip64DiskNumberStart) {
				extraFieldZip64.uint32(fileEntry.diskNumberStart);
			}
			rawExtraFieldZip64 = extraFieldZip64.array;
		} else {
			rawExtraFieldZip64 = EMPTY_UINT8_ARRAY;
		}
		fileEntry.rawExtraFieldZip64 = rawExtraFieldZip64;
		fileEntry.zip64Offset = zip64Offset;
		fileEntry.zip64DiskNumberStart = zip64DiskNumberStart;
		let rawExtraFieldTimestamp;
		const lastModTimeUnix = getTimeUnix(lastModDate);
		if (extendedTimestamp && inUnixTimeRange(lastModTimeUnix)) {
			const extraFieldTimestamp = createRecordWriter(9);
			extraFieldTimestamp.uint16(EXTRAFIELD_TYPE_EXTENDED_TIMESTAMP);
			extraFieldTimestamp.uint16(5);
			extraFieldTimestamp.uint8(extraFieldExtendedTimestampFlag);
			extraFieldTimestamp.uint32(lastModTimeUnix);
			rawExtraFieldTimestamp = extraFieldTimestamp.array;
		} else {
			rawExtraFieldTimestamp = EMPTY_UINT8_ARRAY;
		}
		fileEntry.rawExtraFieldExtendedTimestamp = rawExtraFieldTimestamp;
		const extraFieldLength = getLength(
			rawExtraFieldZip64,
			rawExtraFieldAES,
			rawExtraFieldNTFS,
			rawExtraFieldUnix,
			rawExtraFieldTimestamp,
			rawExtraField);
		if (extraFieldLength > MAX_16_BITS) {
			throw new Error(ERR_INVALID_EXTRAFIELD_DATA);
		}
		directoryDataLength += CENTRAL_FILE_HEADER_LENGTH + getLength(rawFilename, rawComment) + extraFieldLength;
	}
	return directoryDataLength;
}

async function writeDirectoryRecords(zipWriter, directoryDataLength, options) {
	const { files, writer } = zipWriter;
	const directoryArray = new Uint8Array(directoryDataLength);
	await initStream(writer);
	let offset = 0;
	let directoryDiskOffset = 0;
	let cdStartDiskNumber = writer.diskNumber;
	let cdStartDiskOffset = writer.diskOffset;
	for (const [indexFileEntry, fileEntry] of Array.from(files.values()).entries()) {
		const {
			offset: fileEntryOffset,
			rawFilename,
			rawExtraFieldZip64,
			rawExtraFieldAES,
			rawExtraFieldExtendedTimestamp,
			rawExtraFieldNTFS,
			rawExtraFieldUnix,
			rawExtraField,
			rawComment,
			versionMadeBy,
			headerArray,
			headerView,
			zip64UncompressedSize,
			zip64CompressedSize,
			zip64DiskNumberStart,
			zip64Offset,
			internalFileAttributes,
			externalFileAttributes,
			diskNumberStart,
			uncompressedSize,
			compressedSize
		} = fileEntry;
		const extraFieldLength = getLength(rawExtraFieldZip64, rawExtraFieldAES, rawExtraFieldExtendedTimestamp, rawExtraFieldNTFS, rawExtraFieldUnix, rawExtraField);
		const directoryRecordLength = CENTRAL_FILE_HEADER_LENGTH + getLength(rawFilename, rawComment) + extraFieldLength;
		if (offset + directoryRecordLength - directoryDiskOffset > writer.availableSize) {
			await writeData(writer, directoryArray.slice(directoryDiskOffset, offset));
			directoryDiskOffset = offset;
			writer.availableSize = 0;
			await writeData(writer, EMPTY_UINT8_ARRAY);
		}
		if (indexFileEntry == 0) {
			cdStartDiskNumber = writer.diskNumber;
			cdStartDiskOffset = writer.diskOffset;
		}
		if (!zip64UncompressedSize) {
			setUint32(headerView, HEADER_OFFSET_UNCOMPRESSED_SIZE, uncompressedSize);
		}
		if (!zip64CompressedSize) {
			setUint32(headerView, HEADER_OFFSET_COMPRESSED_SIZE, compressedSize);
		}
		if ((zip64Offset || zip64DiskNumberStart) && fileEntry.version < VERSION_ZIP64) {
			setUint16(headerView, HEADER_OFFSET_VERSION, VERSION_ZIP64);
		}
		const directoryRecord = createRecordWriter(directoryRecordLength);
		directoryRecord.uint32(CENTRAL_FILE_HEADER_SIGNATURE);
		directoryRecord.uint16(versionMadeBy);
		directoryRecord.bytes(headerArray.subarray(0, HEADER_SIZE - 4 - 2));
		directoryRecord.uint16(extraFieldLength);
		directoryRecord.uint16(getLength(rawComment));
		directoryRecord.uint16(zip64DiskNumberStart ? MAX_16_BITS : diskNumberStart);
		directoryRecord.uint16(internalFileAttributes);
		directoryRecord.uint32(externalFileAttributes);
		directoryRecord.uint32(zip64Offset ? MAX_32_BITS : fileEntryOffset);
		directoryRecord.bytes(rawFilename);
		directoryRecord.bytes(rawExtraFieldZip64);
		directoryRecord.bytes(rawExtraFieldAES);
		directoryRecord.bytes(rawExtraFieldExtendedTimestamp);
		directoryRecord.bytes(rawExtraFieldNTFS);
		directoryRecord.bytes(rawExtraFieldUnix);
		directoryRecord.bytes(rawExtraField);
		directoryRecord.bytes(rawComment);
		arraySet(directoryArray, directoryRecord.array, offset);
		offset += directoryRecordLength;
		if (options.onprogress) {
			try {
				await options.onprogress(indexFileEntry + 1, files.size, new Entry(fileEntry));
			} catch {
				// ignored
			}
		}
	}
	await writeData(writer, directoryDiskOffset ? directoryArray.slice(directoryDiskOffset) : directoryArray);
	return { cdStartDiskNumber, cdStartDiskOffset };
}

async function writeEndOfDirectoryRecord(zipWriter, comment, options, cdInfo) {
	const { writer } = zipWriter;
	const { cdStartDiskNumber, cdStartDiskOffset } = cdInfo;
	let { directoryDataLength } = cdInfo;
	let filesLength = zipWriter.files.size;
	let diskNumber = cdStartDiskNumber;
	let directoryOffset = zipWriter.offset - cdStartDiskOffset - (cdStartDiskNumber ? zipWriter.initialOffset : 0);
	let lastDiskNumber = writer.diskNumber;
	if (writer.availableSize < END_OF_CENTRAL_DIR_LENGTH) {
		lastDiskNumber++;
	}
	let zip64 = getOptionValue(zipWriter, options, PROPERTY_NAME_ZIP64);
	if (directoryOffset >= MAX_32_BITS || directoryDataLength >= MAX_32_BITS || filesLength >= MAX_16_BITS || lastDiskNumber >= MAX_16_BITS) {
		if (zip64 === false) {
			throw new Error(ERR_UNSUPPORTED_FORMAT);
		} else {
			zip64 = true;
		}
	}
	const commentLength = getLength(comment);
	if (commentLength > MAX_16_BITS) {
		throw new Error(ERR_INVALID_COMMENT);
	}
	const endOfdirectoryRecord = createRecordWriter(zip64 ? ZIP64_END_OF_CENTRAL_DIR_TOTAL_LENGTH : END_OF_CENTRAL_DIR_LENGTH);
	if (getLength(endOfdirectoryRecord.array) + commentLength > writer.availableSize) {
		writer.availableSize = 0;
		await writeData(writer, EMPTY_UINT8_ARRAY);
	}
	lastDiskNumber = writer.diskNumber;
	if (zip64) {
		endOfdirectoryRecord.uint32(ZIP64_END_OF_CENTRAL_DIR_SIGNATURE);
		endOfdirectoryRecord.uint64(44);
		endOfdirectoryRecord.uint16(45);
		endOfdirectoryRecord.uint16(45);
		endOfdirectoryRecord.uint32(lastDiskNumber);
		endOfdirectoryRecord.uint32(diskNumber);
		endOfdirectoryRecord.uint64(filesLength);
		endOfdirectoryRecord.uint64(filesLength);
		endOfdirectoryRecord.uint64(directoryDataLength);
		endOfdirectoryRecord.uint64(directoryOffset);
		endOfdirectoryRecord.uint32(ZIP64_END_OF_CENTRAL_DIR_LOCATOR_SIGNATURE);
		endOfdirectoryRecord.uint32(lastDiskNumber);
		endOfdirectoryRecord.uint64(BigInt(zipWriter.offset) + BigInt(directoryDataLength) - BigInt(writer.diskOffset) - BigInt(writer.diskNumber ? zipWriter.initialOffset : 0));
		endOfdirectoryRecord.uint32(lastDiskNumber + 1);
		const supportZip64SplitFile = getOptionValue(zipWriter, options, OPTION_SUPPORT_ZIP64_SPLIT_FILE, true);
		if (supportZip64SplitFile) {
			lastDiskNumber = MAX_16_BITS;
			diskNumber = MAX_16_BITS;
		}
		filesLength = MAX_16_BITS;
		directoryOffset = MAX_32_BITS;
		directoryDataLength = MAX_32_BITS;
	}
	endOfdirectoryRecord.uint32(END_OF_CENTRAL_DIR_SIGNATURE);
	endOfdirectoryRecord.uint16(lastDiskNumber);
	endOfdirectoryRecord.uint16(diskNumber);
	endOfdirectoryRecord.uint16(filesLength);
	endOfdirectoryRecord.uint16(filesLength);
	endOfdirectoryRecord.uint32(directoryDataLength);
	endOfdirectoryRecord.uint32(directoryOffset);
	endOfdirectoryRecord.uint16(commentLength);
	await writeData(writer, endOfdirectoryRecord.array);
	if (commentLength) {
		await writeData(writer, comment);
	}
}

function createRecordWriter(length) {
	const array = new Uint8Array(length);
	const view = getDataView(array);
	let offset = 0;
	return {
		array,
		uint8: value => { setUint8(view, offset, value); offset += 1; },
		uint16: value => { setUint16(view, offset, value); offset += 2; },
		uint32: value => { setUint32(view, offset, value); offset += 4; },
		uint64: value => { setBigUint64(view, offset, BigInt(value)); offset += 8; },
		bytes: value => { arraySet(array, value, offset); offset += getLength(value); },
		skip: count => offset += count
	};
}

function getSegmentOffset(zipWriter, writer) {
	return zipWriter.offset - writer.diskOffset - (writer.diskNumber ? zipWriter.initialOffset : 0);
}

async function writeData(writer, array) {
	const { writable } = writer;
	const streamWriter = writable.getWriter();
	try {
		await streamWriter.ready;
		writer.size += getLength(array);
		await streamWriter.write(array);
	} finally {
		streamWriter.releaseLock();
	}
}

async function flushBufferedData(readable, writer, signal, onChunkWritten) {
	const streamWriter = writer.writable.getWriter();
	try {
		await readable.pipeTo(new WritableStream({
			async write(chunk) {
				await streamWriter.ready;
				await streamWriter.write(chunk);
				onChunkWritten(getLength(chunk));
			}
		}), { preventClose: true, preventAbort: true, signal });
	} finally {
		streamWriter.releaseLock();
	}
}

function getTimeNTFS(date) {
	if (date) {
		return ((BigInt(date.getTime()) + BigInt(11644473600000)) * BigInt(10000));
	}
}

function getTimeUnix(date) {
	return Math.floor(date.getTime() / 1000);
}

function inUnixTimeRange(timeUnix) {
	return timeUnix >= MIN_UNIX_TIME && timeUnix <= MAX_UNIX_TIME;
}

function clampUnixTime(timeUnix) {
	return Math.min(MAX_UNIX_TIME, Math.max(MIN_UNIX_TIME, timeUnix));
}

function getOptionValue(zipWriter, options, name, defaultValue) {
	const result = options[name] === UNDEFINED_VALUE ? zipWriter.options[name] : options[name];
	return result === UNDEFINED_VALUE ? defaultValue : result;
}

function getMaximumCompressedSize(uncompressedSize) {
	return uncompressedSize + (5 * (Math.floor(uncompressedSize / 16383) + 1));
}

function setUint8(view, offset, value) {
	view.setUint8(offset, value);
}

function setUint16(view, offset, value) {
	view.setUint16(offset, value, true);
}

function setUint32(view, offset, value) {
	view.setUint32(offset, value, true);
}

function setBigUint64(view, offset, value) {
	view.setBigUint64(offset, value, true);
}

function arraySet(array, typedArray, offset) {
	array.set(typedArray, offset);
}

function getDataView(array) {
	return new DataView(array.buffer, array.byteOffset, array.byteLength);
}

function getLength(...arrayLikes) {
	let result = 0;
	arrayLikes.forEach(arrayLike => arrayLike && (result += arrayLike.length));
	return result;
}

function getHeaderArrayData({
	version,
	bitFlag,
	compressionMethod,
	uncompressedSize,
	compressedSize,
	lastModDate,
	rawLastModDate,
	rawFilename,
	zip64CompressedSize,
	zip64UncompressedSize,
	extraFieldLength
}) {
	const headerRecord = createRecordWriter(HEADER_SIZE - 4);
	const headerArray = headerRecord.array;
	const headerView = getDataView(headerArray);
	headerRecord.uint16(version);
	headerRecord.uint16(bitFlag);
	headerRecord.uint16(compressionMethod);
	if (rawLastModDate === UNDEFINED_VALUE) {
		const dateArray = new Uint32Array(1);
		const dateView = getDataView(dateArray);
		setUint16(dateView, 0, (((lastModDate.getHours() << 6) | lastModDate.getMinutes()) << 5) | lastModDate.getSeconds() / 2);
		setUint16(dateView, 2, ((((lastModDate.getFullYear() - 1980) << 4) | (lastModDate.getMonth() + 1)) << 5) | lastModDate.getDate());
		rawLastModDate = dateArray[0];
	}
	headerRecord.uint32(rawLastModDate);
	headerRecord.skip(4);
	if (zip64CompressedSize || compressedSize !== UNDEFINED_VALUE) {
		headerRecord.uint32(zip64CompressedSize ? MAX_32_BITS : compressedSize);
	} else {
		headerRecord.skip(4);
	}
	if (zip64UncompressedSize || uncompressedSize !== UNDEFINED_VALUE) {
		headerRecord.uint32(zip64UncompressedSize ? MAX_32_BITS : uncompressedSize);
	} else {
		headerRecord.skip(4);
	}
	headerRecord.uint16(getLength(rawFilename));
	headerRecord.uint16(extraFieldLength);
	return {
		headerArray,
		headerView,
		rawLastModDate
	};
}

function getBitFlag(level, useUnicodeFileNames, dataDescriptor, encrypted, compressionMethod) {
	let bitFlag = 0;
	if (useUnicodeFileNames) {
		bitFlag = bitFlag | BITFLAG_LANG_ENCODING_FLAG;
	}
	if (dataDescriptor) {
		bitFlag = bitFlag | BITFLAG_DATA_DESCRIPTOR;
	}
	if (compressionMethod == COMPRESSION_METHOD_DEFLATE || compressionMethod == COMPRESSION_METHOD_DEFLATE_64) {
		if (level >= 0 && level <= 3) {
			bitFlag = bitFlag | BITFLAG_LEVEL_SUPER_FAST_MASK;
		}
		if (level > 3 && level <= 5) {
			bitFlag = bitFlag | BITFLAG_LEVEL_FAST_MASK;
		}
		if (level == 9) {
			bitFlag = bitFlag | BITFLAG_LEVEL_MAX_MASK;
		}
	}
	if (encrypted) {
		bitFlag = bitFlag | BITFLAG_ENCRYPTED;
	}
	return bitFlag;
}

/*
 Copyright (c) 2022 Gildas Lormeau. All rights reserved.

 Redistribution and use in source and binary forms, with or without
 modification, are permitted provided that the following conditions are met:

 1. Redistributions of source code must retain the above copyright notice,
 this list of conditions and the following disclaimer.

 2. Redistributions in binary form must reproduce the above copyright 
 notice, this list of conditions and the following disclaimer in 
 the documentation and/or other materials provided with the distribution.

 3. The names of the authors may not be used to endorse or promote products
 derived from this software without specific prior written permission.

 THIS SOFTWARE IS PROVIDED ''AS IS'' AND ANY EXPRESSED OR IMPLIED WARRANTIES,
 INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND
 FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL JCRAFT,
 INC. OR ANY CONTRIBUTORS TO THIS SOFTWARE BE LIABLE FOR ANY DIRECT, INDIRECT,
 INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA,
 OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
 LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
 EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */


function getMimeType$1() {
	return "application/octet-stream";
}

/*
 Copyright (c) 2025 Gildas Lormeau. All rights reserved.

 Redistribution and use in source and binary forms, with or without
 modification, are permitted provided that the following conditions are met:

 1. Redistributions of source code must retain the above copyright notice,
 this list of conditions and the following disclaimer.

 2. Redistributions in binary form must reproduce the above copyright
 notice, this list of conditions and the following disclaimer in
 the documentation and/or other materials provided with the distribution.

 3. The names of the authors may not be used to endorse or promote products
 derived from this software without specific prior written permission.

 THIS SOFTWARE IS PROVIDED ''AS IS'' AND ANY EXPRESSED OR IMPLIED WARRANTIES,
 INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND
 FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL JCRAFT,
 INC. OR ANY CONTRIBUTORS TO THIS SOFTWARE BE LIABLE FOR ANY DIRECT, INDIRECT,
 INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA,
 OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
 LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
 EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */


const DEFAULT_THRESHOLD = 1024 * 1024;
const DEFAULT_DIRECTORY_NAME = ".zip.js-temp";

function createOPFSTempStream(options = {}) {
	const {
		thresholdBytes = DEFAULT_THRESHOLD,
		directoryName = DEFAULT_DIRECTORY_NAME,
		getDirectory = () => navigator.storage.getDirectory()
	} = options;
	let directoryHandlePromise;
	function getTempDirectory() {
		if (!directoryHandlePromise) {
			directoryHandlePromise = Promise.resolve(getDirectory())
				.then(root => root.getDirectoryHandle(directoryName, { create: true }));
		}
		return directoryHandlePromise;
	}
	return function () {
		const memoryChunks = [];
		let bufferedSize = 0;
		let spilled = false;
		let fileName, fileHandle, fileWriter, fileReader;

		async function spillToFile() {
			const directoryHandle = await getTempDirectory();
			fileName = crypto.randomUUID();
			fileHandle = await directoryHandle.getFileHandle(fileName, { create: true });
			fileWriter = (await fileHandle.createWritable()).getWriter();
			spilled = true;
			for (const chunk of memoryChunks) {
				await fileWriter.write(chunk);
			}
			memoryChunks.length = 0;
		}

		const writable = new WritableStream({
			async write(chunk) {
				if (spilled) {
					await fileWriter.write(chunk);
				} else {
					memoryChunks.push(chunk);
					bufferedSize += chunk.length;
					if (bufferedSize > thresholdBytes) {
						await spillToFile();
					}
				}
			},
			async close() {
				if (fileWriter) {
					await fileWriter.close();
					fileWriter = null;
				}
			}
		});

		let memoryIndex = 0;
		const readable = new ReadableStream({
			async pull(controller) {
				if (spilled) {
					if (!fileReader) {
						const file = await fileHandle.getFile();
						fileReader = file.stream().getReader();
					}
					const { value, done } = await fileReader.read();
					if (done) {
						controller.close();
					} else {
						controller.enqueue(value);
					}
				} else if (memoryIndex < memoryChunks.length) {
					controller.enqueue(memoryChunks[memoryIndex++]);
				} else {
					controller.close();
				}
			},
			async cancel(reason) {
				if (fileReader) {
					await fileReader.cancel(reason);
				}
			}
		}, { highWaterMark: 0 });
		async function dispose() {
			if (fileWriter) {
				try {
					await fileWriter.close();
				} catch {
					// ignored
				}
				fileWriter = null;
			}
			if (fileName) {
				try {
					const directoryHandle = await getTempDirectory();
					await directoryHandle.removeEntry(fileName);
				} catch {
					// ignored
				}
				fileHandle = fileName = null;
			}
			memoryChunks.length = 0;
		}

		return { writable, readable, dispose };
	};
}

/*
 Copyright (c) 2025 Gildas Lormeau. All rights reserved.

 Redistribution and use in source and binary forms, with or without
 modification, are permitted provided that the following conditions are met:

 1. Redistributions of source code must retain the above copyright notice,
 this list of conditions and the following disclaimer.

 2. Redistributions in binary form must reproduce the above copyright
 notice, this list of conditions and the following disclaimer in
 the documentation and/or other materials provided with the distribution.

 3. The names of the authors may not be used to endorse or promote products
 derived from this software without specific prior written permission.

 THIS SOFTWARE IS PROVIDED ''AS IS'' AND ANY EXPRESSED OR IMPLIED WARRANTIES,
 INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND
 FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL JCRAFT,
 INC. OR ANY CONTRIBUTORS TO THIS SOFTWARE BE LIABLE FOR ANY DIRECT, INDIRECT,
 INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA,
 OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
 LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
 EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */


try {
	configure({ baseURI: (typeof document === 'undefined' ? require('u' + 'rl').pathToFileURL(__filename).href : (_documentCurrentScript && _documentCurrentScript.tagName.toUpperCase() === 'SCRIPT' && _documentCurrentScript.src || new URL('index-native.cjs', document.baseURI).href)) });
} catch {
	// ignored
}

var{Uint8Array:x,Uint16Array:E,Int32Array:H,TransformStream:U,Math:N,Error:R,Array:v}=globalThis,Se=[16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15],Z=new x(0),Ve=new E(0),de=[];for(let e=0;e<6;e++)de.push(e,0==e?8:4);de.push(0,1);var Ee=[];for(let e=0;e<14;e++)Ee.push(e,0==e?4:2);var ge=new E([0,1,2,3,4,6,8,12,16,24,32,48,64,96,128,192,256,384,512,768,1024,1536,2048,3072,4096,6144,8192,12288,16384,24576]),Te=new E([0,1,2,3,4,5,6,7,8,10,12,14,16,20,24,28,32,40,48,56,64,80,96,112,128,160,192,224,0]);function M(e,t,n,r,i){if(0==i)return;let f=e instanceof x?e:new x(e.buffer,e.byteOffset,e.byteLength),_=n instanceof x?n.subarray(r,r+i):new x(n.buffer,n.byteOffset+r,i);f.set(_,t);}function je(e,t,n){0!=n&&(e instanceof x?e:new x(e.buffer,e.byteOffset,e.byteLength)).fill(0,t,t+n);}function Je(){return {next_in:Z,next_in_index:0,avail_in:0,total_in:0,next_out:Z,next_out_index:0,avail_out:0,total_out:0,msg:"",t:0,i:0,_:0,l:void 0}}function Qe(e,t){let n=1<<t;return {o:e,u:new x(n),h:n,k:t,v:0,m:0,p:0,L:0}}function te(e){let t=[];for(let n=0;n<e.length;n+=2){let r=e[n],i=e[n+1];for(let e=0;e<i;e++)t.push(r);}return new E(t)}var ne=class{constructor(e,t){this.M=e,this.Z=t,this.W=0;}},re=class{constructor(e,t,n,r,i){this.N=e,this.j=t,this.S=n,this.D=r,this.$=i;}};function w_(e){return J_[e<-6||e>2?9:2-e]||""}function Ae(e,t){try{e.msg=w_(t);}catch(n){e.msg="zlib error "+String(t)+" ("+n+")";}return t}function e_(e,t){let n=e>>>0,r=0;for(let e=0;e<t;e++)r=r<<1|1&n,n>>>=1;return r}function g(e,t){e.q[e.T++]=t;}function De(e,t){g(e,255&t),g(e,t>>>8&255);}function __(e,t,n){let r=255&n,i=65535&t,f=e.A+e.O;return e.q[f]=255&i,e.q[f+1]=i>>>8&255,e.q[f+2]=r,e.O+=3,i=i-1&65535,e.U[t_[r]+ie+1].I++,e.B[A_(i)].I++,e.O==e.P}function ye(e,t){let n=255&t,r=e.A+e.O;return e.q[r]=0,e.q[r+1]=0,e.q[r+2]=n,e.O+=3,e.U[n].I++,e.O==e.P}function ve(e){return e.h-ae}function A_(e){return e<256?T_[e]:T_[256+(e>>7)]}function D_(e){let t=He+7,n=1<<t,r=(1<<t)-1,i=N.floor((t+k-1)/k),f=1<<8+He;return {...Qe(e,15),o:e,X:42,F:0,H:void 0,Y:32767,J:t,K:n,R:r,V:i,C:new E(32768),G:new E(n),ee:f,q:new x(32768),te:0,ne:32768,T:0,re:0,ie:0,fe:0,_e:0,le:0,oe:-2,ue:0,ae:0,ce:0,se:0,de:0,he:0,we:0,ke:0,be:0,ge:0,ve:0,me:0,xe:0,ye:0,pe:new H(2*we+1),Le:new x(2*we+1),ze:new E(be+1),O:0,P:0,Me:Z,A:0,Ee:0,Ze:0,We:8,Ne:32768,je:0,Qe:0,Se:0,U:new v(le).fill(0).map(()=>Q()),B:new v(2*me+1).fill(0).map(()=>Q()),De:new v(2*oe+1).fill(0).map(()=>Q()),$e:g_(),qe:g_(),Te:g_()}}function y_(e){let t=[];for(let n=0;n<e.length;n+=2){let r=e[n],i=e[n+1],f=Q();f.Ae=r,f.Oe=i,t.push(f);}return t}function Q(){return {I:0,Ae:0,Ie:0,Oe:0}}function g_(){return new ne([],un(null,Z,0,0,0))}function un(e,t,n,r,i){return new re(e,t,n,r,i)}function Q_(){let e=new v(288).fill(0);for(let t=0;t<=143;t++)e[t]=8;for(let t=144;t<=255;t++)e[t]=9;for(let t=256;t<=279;t++)e[t]=7;for(let t=280;t<=287;t++)e[t]=8;return e}function v_(e){let{code:t,length:n}=cn(e),r=new E(2*e.length),i=0;for(let f=0;f<e.length;f++){let e=n[f]||0,_=t[f]||0;r[i++]=e?e_(_,e):0,r[i++]=e;}return new E(r)}function $_(e,t,n){let r=0;for(let n=0;n<e.length;n++){let i=t[n]?1<<t[n]:1,f=e[n]+i-1;f>r&&(r=f);}r<n&&(r=n);let i=new x(r+1);for(let n=0;n<=r;n++)for(let r=0;r<e.length;r++){let f=t[r]?1<<t[r]:1,_=e[r];if(n>=_&&n<=_+f-1){i[n]=r;break}}return i}function et(e,t){let n=0;for(let r=0;r<e.length;r++){let i=t[r]?1<<t[r]:1,f=e[r]+i-1;f>n&&(n=f);}let r=new x(n+1);for(let i=0;i<=n;i++)for(let n=0;n<e.length;n++){let f=t[n]?1<<t[n]:1,_=e[n];if(i>=_&&i<=_+f-1){r[i]=n;break}}return r}function _t(e){let t=new x(512),n=e.length-1;for(let r=0;r<256;r++)t[r]=r<=n?e[r]:e[n];for(let r=256;r<=n;r++){let n=r>>7;t[256+(n>255?255:n)]=e[r];}for(let e=257;e<512;e++)0==t[e]&&(t[e]=t[e-1]);return t}function cn(e){let t=N.max(...e),n=new v(t+1).fill(0);for(let t of e)t>0&&n[t]++;let r=new v(e.length).fill(0),i=new v(t+1).fill(0),f=0;for(let e=1;e<=t;e++)f=f+n[e-1]<<1,i[e]=f;for(let t=0;t<e.length;t++){let n=e[t];0!=n&&(r[t]=i[n]++);}return {code:r,length:e}}var He=8,k=3,_e=258,ae=_e+k+1,Ue=16,Be=_e,dn=29,ie=256,we=ie+1+dn,me=30,oe=19,le=2*we+1,be=15,tt=9,nt=255,rt=32,at=4,Ie=256,n_=16,r_=17,a_=18,it=0,I_=1,ot=2,$=-1,J_=["need dictionary","stream end","","file error","stream error","data error","insufficient memory","buffer error",""],i_=te(de),o_=te(Ee),Fe=new E(19);Fe[16]=2,Fe[17]=3,Fe[18]=7;var mn=v_(Q_()),bn=v_(new v(30).fill(5)),Ze=y_(mn),k_=y_(bn),t_=$_(Te,i_,_e),T_=_t(et(ge,o_));function Pe(e){return e%65521>>>0}function se(e,t,n){if(void 0===t||void 0===n)return 1;let r=e>>>16&65535;if(e&=65535,1==n)return (e+=t[0])>=65521&&(e-=65521),r+=e,r>=65521&&(r-=65521),(r<<16|e)>>>0;if(n<16){for(let i=0;i<n;i++)r+=e+=t[i];return e>=65521&&(e-=65521),r=Pe(r),(r<<16|e)>>>0}for(;n>=5552;){n-=5552;let i=N.floor(347);do{for(let n=0;n<16;n++)r+=e+=t[n];t=t.subarray(16);}while(--i);e=Pe(e),r=Pe(r);}if(n){for(;n>=16;){n-=16;for(let n=0;n<16;n++)r+=e+=t[n];t=t.subarray(16);}for(let i=0;i<n;i++)r+=e+=t[i];e=Pe(e),r=Pe(r);}return (r<<16|e)>>>0}var Me=[[],[],[],[],[],[],[],[]];for(let e=0;e<256;e++){let t=e;for(let e=0;e<8;e++)t=1&t?3988292384^t>>>1:t>>>1;Me[0][e]=t;}for(let e=0;e<256;e++)for(let t=1;t<8;t++){let n=Me[t-1][e];Me[t][e]=n>>>8^Me[0][255&n];}var[lt,sn,hn,xn,pn,Sn,En,gn]=Me;function W(e=0,t,n){if(!t)return 0;void 0===n&&(n=t.length);let r=0|~e,i=0;if((n=N.min(n,t.length))>=8){let e=new DataView(t.buffer,t.byteOffset,n),f=n-8;for(;i<=f;i+=8){let t=r^e.getInt32(i,true),n=e.getInt32(i+4,true);r=gn[255&t]^En[t>>>8&255]^Sn[t>>>16&255]^pn[t>>>24&255]^xn[255&n]^hn[n>>>8&255]^sn[n>>>16&255]^lt[n>>>24&255];}}for(;i<n;i++)r=r>>>8^lt[255&(r^t[i])];return (4294967295^r)>>>0}function st(e){16==e.L?(De(e,e.p),e.p=0,e.L=0):e.L>=8&&(g(e,e.p),e.p>>=8,e.L-=8);}function ht(e){e.L>8?De(e,e.p):e.L>0&&g(e,e.p),e.Ee=1+(e.L-1&7),e.p=0,e.L=0;}function Tn(e,t,n){let r,i,f=[],_=0;for(r=1;r<=be;r++)_=_+n[r-1]<<1,f[r]=_;for(i=0;i<=t;i++){let t=e[i].Oe;0!=t&&(e[i].Ae=e_(f[t]++,t));}}function L(e,t,n){e.L>Ue-n?(e.p=65535&(e.p|t<<e.L),De(e,e.p),e.p=t>>Ue-e.L&65535,e.L+=n-Ue):(e.p=65535&(e.p|t<<e.L),e.L+=n);}function xt(e){for(let t=0;t<e.U.length;t++)e.U[t].I=0;for(let t=0;t<e.B.length;t++)e.B[t].I=0;for(let t=0;t<e.De.length;t++)e.De[t].I=0;e.U[Ie].I=1,e.ie=e.fe=0,e.O=e._e=0;}function pt(e){if(e.U&&e.U.length>=le)for(let t=0;t<le;t++)e.U[t]=Q();else {e.U=[];for(let t=0;t<le;t++)e.U.push(Q());}if(e.B&&e.B.length>=2*me+1)for(let t=0;t<2*me+1;t++)e.B[t]=Q();else {e.B=[];for(let t=0;t<2*me+1;t++)e.B.push(Q());}if(e.De&&e.De.length>=2*oe+1)for(let t=0;t<2*oe+1;t++)e.De[t]=Q();else {e.De=[];for(let t=0;t<2*oe+1;t++)e.De.push(Q());}e.$e=new ne(e.U,new re(Ze,i_,ie+1,we,be)),e.qe=new ne(e.B,new re(k_,o_,0,me,be)),e.Te=new ne(e.De,new re(null,Fe,0,oe,7)),e.p=0,e.L=0,e.Ee=0,xt(e);}var he=1;function wn(e,t,n){return n=e.pe[he],e.pe[he]=e.pe[e.Qe--],N_(e,t,he),n}function ct(e,t,n,r){return e[t].I<e[n].I||e[t].I==e[n].I&&r[t]<=r[n]}function N_(e,t,n){let r=e.pe[n],i=n<<1;for(;i<=e.Qe&&(i<e.Qe&&ct(t,e.pe[i+1],e.pe[i],e.Le)&&i++,!ct(t,r,e.pe[i],e.Le));)e.pe[n]=e.pe[i],n=i,i<<=1;e.pe[n]=r;}function An(e,t){let n,r,i,f,_,l,o=t.M,u=t.W,a=t.Z.N,c=t.Z.j,s=t.Z.S,d=t.Z.$,h=0;for(f=0;f<=be;f++)e.ze[f]=0;for(o[e.pe[e.Se]].Oe=0,n=e.Se+1;n<le;n++)r=e.pe[n],f=o[o[r].Ie].Oe+1,f>d&&(f=d,h++),o[r].Oe=f,!(r>u)&&(e.ze[f]++,_=0,r>=s&&(_=c[r-s]),l=o[r].I,e.ie+=l*(f+_),a&&(e.fe+=l*(a[r].Oe+_)));if(0!=h){do{for(f=d-1;0==e.ze[f];)f--;e.ze[f]--,e.ze[f+1]+=2,e.ze[d]--,h-=2;}while(h>0);for(f=d;0!=f;f--)for(r=e.ze[f];0!=r;)i=e.pe[--n],!(i>u)&&(o[i].Oe!=f&&(e.ie+=(f-o[i].Oe)*o[i].I,o[i].Oe=f),r--);}}function z_(e,t){let n,r,i,f=t.M,_=t.Z.N,l=t.Z.D,o=-1;for(e.Qe=0,e.Se=le,n=0;n<l;n++)0!=f[n].I?(e.pe[++e.Qe]=o=n,e.Le[n]=0):f[n].Oe=0;for(;e.Qe<2;)i=e.pe[++e.Qe]=o<2?++o:0,f[i].I=1,e.Le[i]=0,e.ie--,_&&(e.fe-=_[i].Oe);for(t.W=o,n=N.floor(e.Qe/2);n>=1;n--)N_(e,f,n);i=l;do{n=wn(e,f,n),r=e.pe[he],e.pe[--e.Se]=n,e.pe[--e.Se]=r,f[i].I=f[n].I+f[r].I,e.Le[i]=(e.Le[n]>=e.Le[r]?e.Le[n]:e.Le[r])+1,f[n].Ie=f[r].Ie=i,e.pe[he]=i++,N_(e,f,he);}while(e.Qe>=2);e.pe[--e.Se]=e.pe[he],An(e,t),Tn(f,t.W,e.ze);}function dt(e,t,n){let r,i,f=-1,_=t[0].Oe,l=0,o=7,u=4;for(0==_&&(o=138,u=3),t[n+1].Oe=65535,r=0;r<=n;r++)i=_,_=t[r+1].Oe,!(++l<o&&i==_)&&(l<u?e.De[i].I+=l:0!=i?(i!=f&&e.De[i].I++,e.De[n_].I++):l<=10?e.De[r_].I++:e.De[a_].I++,l=0,f=i,0==_?(o=138,u=3):i==_?(o=6,u=3):(o=7,u=4));}function mt(e,t,n){let r,i=-1,f=t[0].Oe,_=0,l=7,o=4;0==f&&(l=138,o=3);for(let u=0;u<=n;u++)if(r=f,f=t[u+1].Oe,!(++_<l&&r==f)){if(_<o)do{L(e,e.De[r].Ae,e.De[r].Oe);}while(0!=--_);else 0!=r?(r!=i&&(L(e,e.De[r].Ae,e.De[r].Oe),_--),L(e,e.De[n_].Ae,e.De[n_].Oe),L(e,_-3,2)):_<=10?(L(e,e.De[r_].Ae,e.De[r_].Oe),L(e,_-3,3)):(L(e,e.De[a_].Ae,e.De[a_].Oe),L(e,_-11,7));_=0,i=r,0==f?(l=138,o=3):r==f?(l=6,o=3):(l=7,o=4);}}function Dn(e){let t;for(dt(e,e.U,e.$e.W),dt(e,e.B,e.qe.W),z_(e,e.Te),t=oe-1;t>=3&&0==e.De[Se[t]].Oe;t--);return e.ie+=3*(t+1)+5+5+4,t}function yn(e,t,n,r){let i;for(L(e,t-257,5),L(e,n-1,5),L(e,r-4,4),i=0;i<r;i++)L(e,e.De[Se[i]].Oe,3);mt(e,e.U,t-1),mt(e,e.B,n-1);}function Xe(e,t,n,r,i=0){L(e,(it<<1)+r,3),ht(e),De(e,n),De(e,~n),n&&t&&M(e.q,e.T,t,i,n),e.T+=n;}function St(e){st(e);}function Et(e){L(e,I_<<1,3),L(e,Ze[Ie].Ae,Ze[Ie].Oe),st(e);}function bt(e,t,n){let r,i,f,_,l=0;if(0!=e.O)do{r=255&e.Me[l],r+=(255&e.Me[l+1])<<8,i=e.Me[l+2],l+=3,0==r?L(e,t[i].Ae,t[i].Oe):(f=t_[i],L(e,t[f+ie+1].Ae,t[f+ie+1].Oe),_=i_[f],0!=_&&(i-=Te[f],L(e,i,_)),r--,f=A_(r),L(e,n[f].Ae,n[f].Oe),_=o_[f],0!=_&&(r-=ge[f],L(e,r,_)));}while(l<e.O);L(e,t[Ie].Ae,t[Ie].Oe);}function vn(e){let t,n=4093624447;for(t=0;t<=31;t++,n>>=1)if(1&n&&0!=e.U[t].I)return 0;if(0!=e.U[9].I||0!=e.U[10].I||0!=e.U[13].I)return 1;for(t=32;t<ie;t++)if(0!=e.U[t].I)return 1;return 0}function gt(e,t,n,r,i=0){let f,_,l=0;e.be>0?(2==e.o.t&&(e.o.t=vn(e)),z_(e,e.$e),z_(e,e.qe),l=Dn(e),f=e.ie+3+7>>3,_=e.fe+3+7>>3,(_<=f||4==e.ge)&&(f=_)):f=_=n+5,n+4<=f&&t?Xe(e,t,n,r,i):_==f?(L(e,(I_<<1)+r,3),bt(e,Ze,k_)):(L(e,(ot<<1)+r,3),yn(e,e.$e.W+1,e.qe.W+1,l+1),bt(e,e.U,e.B)),xt(e),r&&ht(e);}function Dt(){let e=Je();return e.l=D_(e),e}var We=[{Ue:zt,Be:0,Pe:0,Xe:0,Fe:0},{Ue:L_,Be:4,Pe:4,Xe:8,Fe:4},{Ue:L_,Be:5,Pe:5,Xe:16,Fe:8},{Ue:L_,Be:6,Pe:16,Xe:32,Fe:32},{Ue:ze,Be:4,Pe:4,Xe:16,Fe:16},{Ue:ze,Be:16,Pe:8,Xe:16,Fe:32},{Ue:ze,Be:16,Pe:16,Xe:32,Fe:128},{Ue:ze,Be:32,Pe:32,Xe:128,Fe:256},{Ue:ze,Be:128,Pe:128,Xe:256,Fe:1024},{Ue:ze,Be:258,Pe:258,Xe:258,Fe:4096}];function Tt(e){return 2*e-(e>4?9:0)}function u_(e,t,n){return ((t<<e.V^n)&e.R)>>>0}function c_(e,t){e.ke=u_(e,e.ke,e.u[t+(k-1)]);let n=e.C[t&e.Y]=e.G[e.ke];return e.G[e.ke]=t,n}function yt(e){e.G[e.K-1]=0,je(e.G,0,(e.K-1)*e.G.BYTES_PER_ELEMENT);}function Ln(e){let t,n,r=e.h;for(t=e.K;t>0;)t--,n=e.G[t],e.G[t]=n>=r?n-r:0;for(t=r;t>0;)t--,n=e.C[t],e.C[t]=n>=r?n-r:0;}function O_(e,t,n,r){let i=e.avail_in;return i>r&&(i=r),0==i?0:(e.avail_in-=i,M(t,n,e.next_in,e.next_in_index,i),1==e.l.F?e.i=se(e.i,new x(t.buffer,t.byteOffset+n,i),i):2==e.l.F&&(e.i=W(e.i,new x(t.buffer,t.byteOffset+n,i),i)),e.next_in_index+=i,e.total_in+=i,i)}function d_(e){let t,n,r=e.h;do{if(n=e.Ne-e.ce-e.ae,0==n&&0==e.ae&&0==e.ce?n=r:-1==n&&n--,e.ae>=r+ve(e)&&(M(e.u,0,e.u,r,r-n),e.je-=r,e.ae-=r,e.ue-=r,e.le>e.ae&&(e.le=e.ae),Ln(e),n+=r),0==e.o.avail_in)break;if(t=O_(e.o,e.u,e.ae+e.ce,n),e.ce+=t,e.ce+e.le>=k){let t=e.ae-e.le;for(e.ke=e.u[t],e.ke=u_(e,e.ke,e.u[t+1]);e.le&&(e.ke=u_(e,e.ke,e.u[t+k-1]),e.C[t&e.Y]=e.G[e.ke],e.G[e.ke]=t,t++,e.le--,!(e.ce+e.le<k)););}}while(e.ce<ae&&0!=e.o.avail_in);if(e.v<e.Ne){let t,n=e.ae+e.ce;e.v<n?(t=e.Ne-n,t>Be&&(t=Be),je(e.u,n,t),e.v=n+t):e.v<n+Be&&(t=n+Be-e.v,t>e.Ne-e.v&&(t=e.Ne-e.v),je(e.u,e.v,t),e.v+=t);}}function vt(e,t,n=8,r=15,i=He,f=0){let _=1;if(!e)return  -2;if(e.msg="",-1==t&&(t=6),r<0){if(_=0,r<-15)return  -2;r=-r;}else r>15&&(_=2,r-=16);if(i<1||i>tt||8!=n||r<8||r>15||t<0||t>9||f<0||f>4||8==r&&1!=_)return  -2;8==r&&(r=9);let l=D_(e);return l?(e.l=l,l.o=e,l.X=42,l.F=_,l.H=void 0,l.k=r,l.h=1<<l.k,l.Y=l.h-1,l.J=i+7,l.K=1<<l.J,l.R=l.K-1,l.V=(l.J+k-1)/k,l.u=new x(2*l.h),l.C=new E(l.h),l.G=new E(l.K),l.v=0,l.ee=1<<i+6,l.q=new x(l.ee*at),l.ne=4*l.ee,l.u&&l.C&&l.G&&l.q?(l.Me=l.q.subarray(l.ee),l.A=l.te+l.ee,l.P=3*(l.ee-1),l.be=t,l.ge=f,l.We=n,Un(e)):(l.X=666,e.msg=w_(-4),F_(e),-4)):-4}function B_(e){if(null==e)return  true;let t=e.l;return !t||t.o!=e||42!=t.X&&57!=t.X&&69!=t.X&&73!=t.X&&91!=t.X&&103!=t.X&&113!=t.X&&666!=t.X}function On(e){let t;return B_(e)?-2:(e.total_in=e.total_out=0,e.msg="",e.t=2,t=e.l,t.T=0,t.re=t.te,t.F<0&&(t.F=-t.F),t.X=2==t.F?57:42,e.i=2==t.F?W(0):se(0),t.oe=-2,pt(t),0)}function Hn(e){e.Ne=2*e.h,yt(e),e.ye=We[e.be].Be,e.ve=We[e.be].Pe,e.me=We[e.be].Xe,e.xe=We[e.be].Fe,e.ae=0,e.ue=0,e.ce=0,e.le=0,e.se=e.de=k-1,e.we=0,e.ke=0;}function Un(e){let t=On(e);return 0==t&&Hn(e.l),t}function Ye(e,t){g(e,t>>8),g(e,255&t);}function q(e){let t,n=e.l;St(n),t=n.T,t>e.avail_out&&(t=e.avail_out),0!=t&&(M(e.next_out,e.next_out_index,n.q,n.re,t),e.next_out_index+=t,n.re+=t,e.total_out+=t,e.avail_out-=t,n.T-=t,0==n.T&&(n.re=n.te));}function ke(e,t){let n=e.l;n.H&&n.H.He&&(e.i=W(e.i,new x(n.q.buffer,n.te+t,n.T-t),n.T-t));}function It(e,t){let n,r=e.l;if(B_(e)||t>5||t<0)return Ae(e,-2);if(!e.next_out||0!=e.avail_in&&!e.next_in||666==r.X&&4!=t)return Ae(e,-2);if(0==e.avail_out)return Ae(e,-5);if(n=r.oe,r.oe=t,0!=r.T){if(q(e),0==e.avail_out)return r.oe=$,0}else if(0==e.avail_in&&Tt(t)<=Tt(n)&&4!=t)return Ae(e,-5);if(666==r.X&&0!=e.avail_in)return Ae(e,-5);if(42==r.X&&0==r.F&&(r.X=113),42==r.X){let t,n=8+(r.k-8<<4)<<8;if(t=r.ge>=2||r.be<2?0:r.be<6?1:6==r.be?2:3,n|=t<<6,0!=r.ae&&(n|=rt),n+=31-n%31,Ye(r,n),0!=r.ae&&(Ye(r,e.i>>16),Ye(r,65535&e.i)),e.i=1,r.X=113,q(e),0!=r.T)return r.oe=$,0}if(57==r.X)if(e.i=W(0),g(r,31),g(r,139),g(r,8),r.H)g(r,(r.H.Ye?1:0)+(r.H.He?2:0)+(null==r.H.Je?0:4)+(null==r.H.Ke?0:8)+(null==r.H.Re?0:16)),g(r,255&r.H.Ve),g(r,r.H.Ve>>>8&255),g(r,r.H.Ve>>>16&255),g(r,r.H.Ve>>>24&255),g(r,9==r.be?2:r.ge>=2||r.be<2?4:0),g(r,255&r.H.Ce),null!=r.H.Je&&(g(r,255&r.H.Ge),g(r,r.H.Ge>>>8&255)),r.H.He&&(e.i=W(e.i,r.q,r.T)),r.Ze=0,r.X=69;else if(g(r,0),g(r,0),g(r,0),g(r,0),g(r,0),g(r,9==r.be?2:r.ge>=2||r.be<2?4:0),g(r,nt),r.X=113,q(e),0!=r.T)return r.oe=$,0;if(69==r.X){if(r.H&&null!=r.H.Je){let t=r.T,n=(65535&r.H.Ge)-r.Ze;for(;r.T+n>r.ne;){let i=r.ne-r.T;if(M(r.q,r.T,r.H.Je,r.Ze,i),r.T=r.ne,ke(e,t),r.Ze+=i,q(e),0!=r.T)return r.oe=$,0;t=0,n-=i;}M(r.q,r.T,r.H.Je,r.Ze,n),r.T+=n,ke(e,t),r.Ze=0;}r.X=73;}if(73==r.X){if(r.H&&r.H.Ke&&r.H.Ke.length){let t,n=r.T;do{if(r.T==r.ne){if(ke(e,n),q(e),0!=r.T)return r.oe=$,0;n=0;}t=r.H.Ke[r.Ze++],g(r,t);}while(0!=t);ke(e,n),r.Ze=0;}r.X=91;}if(91==r.X){if(r.H&&r.H.Re&&r.H.Re.length){let t,n=r.T;do{if(r.T==r.ne){if(ke(e,n),q(e),0!=r.T)return r.oe=$,0;n=0;}t=r.H.Re[r.Ze++],g(r,t);}while(0!=t);ke(e,n);}r.X=103;}if(103==r.X){if(r.H&&r.H.He){if(r.T+2>r.ne&&(q(e),0!=r.T))return r.oe=$,0;g(r,255&e.i),g(r,e.i>>>8&255),e.i=W(0);}if(r.X=113,q(e),0!=r.T)return r.oe=$,0}if(0!=e.avail_in||0!=r.ce||0!=t&&666!=r.X){let n=0==r.be?zt(r,t):2==r.ge?Fn(r,t):3==r.ge?Bn(r,t):We[r.be].Ue(r,t);if((2==n||3==n)&&(r.X=666),0==n||2==n)return 0==e.avail_out&&(r.oe=$),0;if(1==n&&(1==t?Et(r):5!=t&&(Xe(r,null,0,0),3==t&&(yt(r),0==r.ce&&(r.ae=0,r.ue=0,r.le=0))),q(e),0==e.avail_out))return r.oe=$,0}return 4!=t?0:r.F<=0?1:(2==r.F?(g(r,255&e.i),g(r,e.i>>>8&255),g(r,e.i>>>16&255),g(r,e.i>>>24&255),g(r,255&e.total_in),g(r,e.total_in>>>8&255),g(r,e.total_in>>>16&255),g(r,e.total_in>>>24&255)):(Ye(r,e.i>>>16&65535),Ye(r,65535&e.i)),q(e),r.F>0&&(r.F=-r.F),0!=r.T?0:1)}function F_(e){if(B_(e))return  -2;let t=e.l,n=t.X;return t.u=Z,t.C=Ve,t.G=Ve,t.q=Z,t.Me=Z,t.pe=new H(0),t.Le=Z,t.ze=Ve,t.U.length=0,t.B.length=0,t.De.length=0,t.H=void 0,t.te=0,t.re=0,t.A=0,113==n?-3:0}function kt(e,t){let n,r,i=e.xe,f=e.ae,_=e.de,l=e.me,o=e.ae>ve(e)?e.ae-ve(e):0,u=e.C,a=e.Y,c=e.u[f],s=e.u[f+1],d=e.u[f+_-1],h=e.u[f+_];e.de>=e.ve&&(i>>=2),l>e.ce&&(l=e.ce);do{if(n=t,e.u[n+_]!=h||e.u[n+_-1]!=d||e.u[n]!=c||e.u[n+1]!=s)continue;let i=N.min(_e,e.ce),o=2;for(;o<i&&e.u[f+o]==e.u[n+o];)o++;if(r=o,r>_){if(e.je=t,_=r,r>=l)break;d=e.u[f+_-1],h=e.u[f+_];}}while((t=u[t&a])>o&&0!=--i);return _<=e.ce?_:e.ce}function Nt(e,t){gt(e,e.u,e.ae-e.ue,t,e.ue),e.ue=e.ae,q(e.o);}function j(e,t){return Nt(e,t?1:0),0==e.o.avail_out?t?2:0:null}var wt=65535;function Ne(e,t){return e<t?e:t}function zt(e,t){let n,r,i,f=Ne(e.ne-5,e.h),_=0,l=e.o.avail_in;do{if(n=wt,i=e.L+42>>3,e.o.avail_out<i||(i=e.o.avail_out-i,r=e.ae-e.ue,n>r+e.o.avail_in&&(n=r+e.o.avail_in),n>i&&(n=i),n<f&&(0==n&&4!=t||0==t||n!=r+e.o.avail_in)))break;_=4==t&&n==r+e.o.avail_in?1:0,Xe(e,null,0,_),e.q[e.T-4]=n,e.q[e.T-3]=n>>8,e.q[e.T-2]=~n,e.q[e.T-1]=~n>>8,q(e.o),r&&(r>n&&(r=n),M(e.o.next_out,e.o.next_out_index,e.u,e.ue,r),e.o.next_out_index+=r,e.o.avail_out-=r,e.o.total_out+=r,e.ue+=r,n-=r),n&&(O_(e.o,e.o.next_out,e.o.next_out_index,n),e.o.next_out_index+=n,e.o.avail_out-=n,e.o.total_out+=n);}while(0==_);if(l-=e.o.avail_in,l){if(l>=e.h){e._e=2;let t=e.o.next_in_index-e.h;M(e.u,0,e.o.next_in,t,e.h),e.ae=e.h,e.le=e.ae;}else e.Ne-e.ae<=l&&(e.ae-=e.h,M(e.u,0,e.u,e.h,e.ae),e._e<2&&e._e++,e.le>e.ae&&(e.le=e.ae)),M(e.u,e.ae,e.o.next_in,e.o.next_in_index-l,l),e.ae+=l,e.le+=Ne(l,e.h-e.le);e.ue=e.ae;}return e.v<e.ae&&(e.v=e.ae),_?(e.Ee=8,3):0!=t&&4!=t&&0==e.o.avail_in&&e.ae==e.ue?1:(i=e.Ne-e.ae,e.o.avail_in>i&&e.ue>=e.h&&(e.ue-=e.h,e.ae-=e.h,M(e.u,0,e.u,e.h,e.ae),e._e<2&&e._e++,i+=e.h,e.le>e.ae&&(e.le=e.ae)),i>e.o.avail_in&&(i=e.o.avail_in),i&&(O_(e.o,e.u,e.ae,i),e.ae+=i,e.le+=Ne(i,e.h-e.le)),e.v<e.ae&&(e.v=e.ae),i=e.L+42>>3,i=Ne(e.ne-i,wt),f=Ne(i,e.h),r=e.ae-e.ue,(r>=f||(r||4==t)&&0!=t&&0==e.o.avail_in&&r<=i)&&(n=Ne(r,i),_=4==t&&0==e.o.avail_in&&n==r?1:0,Xe(e,e.u,n,_,e.ue),e.ue+=n,q(e.o)),_&&(e.Ee=8),_?2:0)}function L_(e,t){let n,r=false;for(;;){if(e.ce<ae){if(d_(e),e.ce<ae&&0==t)return 0;if(0==e.ce)break}if(n=0,e.ce>=k&&(n=c_(e,e.ae)),0!=n&&e.ae-n<=ve(e)&&(e.se=kt(e,n)),e.se>=k)if(e.ae,e.je,e.se,r=__(e,e.ae-e.je,e.se-k),e.ce-=e.se,e.se<=e.ye&&e.ce>=k){e.se--;do{e.ae++,n=c_(e,e.ae);}while(0!=--e.se);e.ae++;}else e.ae+=e.se,e.se=0,e.ke=e.u[e.ae],e.ke=u_(e,e.ke,e.u[e.ae+1]);else r=ye(e,e.u[e.ae]),e.ce--,e.ae++;if(r){let t=j(e,false);if(null!=t)return t}}if(e.le=e.ae<k-1?e.ae:k-1,4==t){return j(e,true)??3}if(e.O){let t=j(e,false);if(null!=t)return t}return 1}function ze(e,t){let n,r=false;for(;;){if(e.ce<ae){if(d_(e),e.ce<ae&&0==t)return 0;if(0==e.ce)break}if(n=0,e.ce>=k&&(n=c_(e,e.ae)),e.de=e.se,e.he=e.je,e.se=k-1,0!=n&&e.de<e.ye&&e.ae-n<=ve(e)&&(e.se=kt(e,n),e.se<=5&&1==e.ge&&(e.se=k-1)),e.de>=k&&e.se<=e.de){let t=e.ae+e.ce-k;e.ae,e.he,e.de,r=__(e,e.ae-1-e.he,e.de-k),e.ce-=e.de-1,e.de-=2;do{++e.ae<=t&&(n=c_(e,e.ae));}while(0!=--e.de);if(e.we=0,e.se=k-1,e.ae++,r){let t=j(e,false);if(null!=t)return t}}else if(e.we){if(r=ye(e,e.u[e.ae-1]),r&&Nt(e,0),e.ae++,e.ce--,0==e.o.avail_out)return 0}else e.we=1,e.ae++,e.ce--;}if(e.we&&(r=ye(e,e.u[e.ae-1]),e.we=0),e.le=e.ae<k-1?e.ae:k-1,4==t){return j(e,true)??3}if(e.O){let t=j(e,false);if(null!=t)return t}return 1}function Bn(e,t){let n,r,i,f;for(;;){if(e.ce<=_e){if(d_(e),e.ce<=_e&&0==t)return 0;if(0==e.ce)break}if(e.se=0,e.ce>=k&&e.ae>0&&(i=e.ae-1,r=e.u[i],r==++i&&r==++i&&r==++i)){f=e.ae+_e;do{}while(r==++i&&r==++i&&r==++i&&r==++i&&r==++i&&r==++i&&r==++i&&r==++i&&i<f);e.se=_e-(f-i),e.se>e.ce&&(e.se=e.ce);}if(e.se>=k?(e.ae,e.ae,e.se,n=__(e,1,e.se-k),e.ce-=e.se,e.ae+=e.se,e.se=0):(n=ye(e,e.u[e.ae]),e.ce--,e.ae++),n){let t=j(e,false);if(null!=t)return t}}if(e.le=0,4==t){return j(e,true)??3}if(e.O){let t=j(e,false);if(null!=t)return t}return 1}function Fn(e,t){let n=false;for(;;){if(0==e.ce&&(d_(e),0==e.ce)){if(0==t)return 0;break}if(e.se=0,n=ye(e,e.u[e.ae]),e.ce--,e.ae++,n){let t=j(e,false);if(null!=t)return t}}if(e.le=0,4==t){return j(e,true)??3}if(e.O){let t=j(e,false);if(null!=t)return t}return 1}var ue=852,m_=592,b_=594,Rt=ge.map(e=>e+1),Ct=Te.subarray(0,-1).map(e=>e+3),Zn=[16,1,73,1,200,1],Pn=[144,1,72,1,78,1],Lt=Ee.map(Gt),Ot=Ee.map(Kt);Lt.push(64,2),Ot.push(142,2);var Ht=de.slice(0,-2).map(Gt),Ut=de.slice(0,-2).map(Kt);Ht.push(...Zn),Ut.push(...Pn);var Bt=new E([...Ct,258,0,0]),Ft=new E([...Ct,3,0,0]),Zt=te(Ht),Pt=te(Ut),Mt=new E([...Rt,0,0]),Xt=new E([...Rt,32769,49153]),Yt=te(Lt),Wt=te(Ot);function Gt(e,t){return t%2?e:e+16}function Kt(e,t){return t%2?e:e+128}function Vt(e,t){let n,r=e.l,i=e.next_in_index,f=e.next_out_index,_=e.next_in,l=e.next_out,o=r.u,u=r.p>>>0,a=r.L>>>0,c=r.et,s=r.tt,d=(1<<r.nt)-1,h=(1<<r.rt)-1,w=r.h>>>0,k=r.v>>>0,b=r.m>>>0,g=r.it,v=f-(t-e.avail_out),m=f+(e.avail_out-257),x=i+(e.avail_in-5),y=0,p=0,L=0,z=0;e:do{for(;a<15;){if(!(i<_.length))break e;u+=_[i++]<<a,a+=8;}n=c[u&d];t:for(;;){if(L=n.ft,u>>>=L,a-=L,L=n._t,0==L){l[f++]=n.lt;break}if(16&L){if(y=n.lt,L&=15,L){for(;a<L;){if(!(i<_.length)){r.ot=16200;break e}u+=_[i++]<<a,a+=8;}y+=u&(1<<L)-1,u>>>=L,a-=L;}for(;a<15;){if(!(i<_.length)){r.ot=16200;break e}u+=_[i++]<<a,a+=8;}n=s[u&h];n:for(;;){if(L=n.ft,u>>>=L,a-=L,L=n._t,16&L){if(p=n.lt,L&=15,L){for(;a<L;){if(!(i<_.length)){r.ot=16200;break e}u+=_[i++]<<a,a+=8;}p+=u&(1<<L)-1,u>>>=L,a-=L;}let t=y,c=f-v;if(p>c){let n=p-c;if(n>k&&g){e.msg="invalid distance too far back",r.ot=16209;break e}if(0==b){if(z=w-n,!(n<t)){for(let e=0;e<t;++e)l[f++]=o[z++];continue e}for(let e=0;e<n;++e)l[f++]=o[z++];t-=n,z=f-p;}else if(b<n){z=w+b-n;let e=n-b;if(!(e<t)){for(let e=0;e<t;++e)l[f++]=o[z++];continue e}for(let t=0;t<e;++t)l[f++]=o[z++];if(t-=e,z=0,b<t){for(let e=0;e<b;++e)l[f++]=o[z++];t-=b,z=f-p;}}else {if(z=b-n,!(n<t)){for(let e=0;e<t;++e)l[f++]=o[z++];continue e}for(let e=0;e<n;++e)l[f++]=o[z++];t-=n,z=f-p;}for(;t>2;)l[f++]=l[z++],l[f++]=l[z++],l[f++]=l[z++],t-=3;t&&(l[f++]=l[z++],t>1&&(l[f++]=l[z++]));}else {for(z=f-p;t>2;)l[f++]=l[z++],l[f++]=l[z++],l[f++]=l[z++],t-=3;t&&(l[f++]=l[z++],t>1&&(l[f++]=l[z++]));}break}if(64&L){e.msg="invalid distance code",r.ot=16209;break e}n=s[n.lt+(u&(1<<L)-1)];continue n}break}if(64&L){if(32&L){r.ot=16191;break e}e.msg="invalid literal/length code",r.ot=16209;break e}n=c[n.lt+(u&(1<<L)-1)];continue t}}while(i<x&&f<m);let M=a>>3;i-=M,a-=M<<3,u&=(1<<a)-1,e.next_in_index=i,e.next_out_index=f,e.avail_in=i<x?x-i+5:5-(i-x),e.avail_out=f<m?m-f+257:257-(f-m),r.p=u>>>0,r.L=a>>>0;}function Z_(e,t){let n=[],r=t?ue+b_:ue+m_;return {...Qe(e,0),o:e,ot:16180,ut:false,F:0,ct:false,st:0,dt:0,ht:0,wt:0,u:Z,kt:0,bt:0,Je:0,et:n,tt:n,nt:0,rt:0,gt:0,vt:0,xt:0,yt:0,Lt:n,zt:new E(320),Mt:new E(288),Et:new v(r).fill(null).map(()=>pe()),Zt:0,it:true,Wt:0,Nt:0,jt:t}}function pe(e=0,t=0,n=0){return {_t:e,ft:t,lt:n}}function P_(e=1){return {_t:64,ft:e,lt:0}}function jt(e=0){return {_t:96,ft:e,lt:0}}function M_(e){return (255&e)<<24|(e>>8&255)<<16|(e>>16&255)<<8|e>>24&255}var Le=15,Xn={jt:false,Qt:Bt,St:Zt,Dt:Mt,$t:Yt,qt:20,Tt:257,At:0,Ot:m_,It:false,Ut:true},Yn={jt:true,Qt:Ft,St:Pt,Dt:Xt,$t:Wt,qt:19,Tt:256,At:-1,Ot:b_,It:true,Ut:false};function Oe(e,t,n,r,i,f,_,l){let o,u,a,c,s,d,h,w,k,b,g,v,m,x,y,p,L,z,M,Z=new E(Le+1),W=new E(Le+1),N=l?Yn:Xn;for(o=0;o<=Le;o++)Z[o]=0;for(u=0;u<n;u++)Z[t[u]]++;for(s=i.Bt,c=Le;c>=1&&0==Z[c];c--);if(s>c&&(s=c),0==c)return N.Ut?(y=P_(1),r.Bt[0]=y,r.Bt[1]=y,i.Bt=1,0):-1;for(a=1;a<c&&0==Z[a];a++);for(s<a&&(s=a),w=1,o=1;o<=Le;o++)if(w<<=1,w-=Z[o],w<0)return  -1;if(w>0&&(0==e||1!=c))return  -1;for(W[1]=0,o=1;o<Le;o++)W[o+1]=W[o]+Z[o];for(u=0;u<n;u++)0!=t[u]&&(f[W[t[u]]++]=u);switch(e){case 0:L=z=f,M=N.qt;break;case 1:L=N.Qt,z=N.St,M=N.Tt;break;default:L=N.Dt,z=N.$t,M=N.At;}if(b=0,u=0,o=a,p=_.Bt,d=s,h=0,m=-1,k=1<<s,x=k-1,1==e&&(N.It?k>=ue:k>ue)||2==e&&(N.It?k>=N.Ot:k>N.Ot))return 1;for(;;){y=Wn(f,u,o,h,e,L,z,M,N.jt),g=1<<o-h,v=1<<d,a=v;do{v-=g;let e=(b>>h)+v;r.Bt[p+e]={...y};}while(0!=v);for(g=1<<o-1;b&g;)g>>=1;if(0!=g?(b&=g-1,b+=g):b=0,u++,0==--Z[o]){if(o==c)break;o=t[f[u]];}if(o>s&&(b&x)!=m){for(0==h&&(h=s),p+=1<<d,d=o-h,w=1<<d;d+h<c&&(w-=Z[d+h],!(w<=0));)d++,w<<=1;if(k+=1<<d,1==e&&(N.It?k>=ue:k>ue)||2==e&&(N.It?k>=N.Ot:k>N.Ot))return 1;m=b&x,r.Bt[_.Bt+m]={_t:d,ft:s,lt:p-_.Bt};}}if(0!=b)for(y=P_(o-h);0!=b;){for(0!=h&&(b&x)!=m&&(h=0,o=s,p=_.Bt,d=s,y.ft=o),r.Bt[p+(b>>h)]={...y},g=1<<o-1;b&g;)g>>=1;0!=g?(b&=g-1,b+=g):b=0;}return _.Bt+=k,i.Bt=s,0}function Wn(e,t,n,r,i,f,_,l,o){let u;if(o?e[t]<l:e[t]+1<l)u=pe(0,n-r,e[t]);else if(o?e[t]>l:e[t]>=l)if(o&&1==i){let i=e[t]-257;u=pe(_[i],n-r,f[i]);}else {let i=o?e[t]:e[t]-l;u=pe(_[i],n-r,f[i]);}else u=jt(n-r);return u}var Vn={Pt:true,Xt:new v(544),Ft:[],Ht:[]},jn={Pt:true,Xt:new v(544),Ft:[],Ht:[]};function Jt(){let e=Je();return e.l=Z_(e,false),e}function Ke(e){let t;return !(e&&(t=e.l,!(!t||t.o!=e||t.jt&&(t.ot<16191||t.ot>16209)||!t.jt&&(t.ot<16180||t.ot>16211))))}function Jn(e){let t;return Ke(e)?-2:(t=e.l,e.total_in=e.total_out=t.wt=0,e.msg="",t.F&&(e.i=1&t.F),t.ot=t.jt?16191:16180,t.ut=false,t.ct=false,t.st=-1,t.dt=t.jt?65536:32768,delete t.H,t.p=0,t.L=0,t.et=t.Et,t.tt=t.Et,t.Lt=t.Et,t.it=true,t.Wt=-1,0)}function Qn(e){let t;return Ke(e)?-2:(t=e.l,t.h=0,t.v=0,t.m=0,Jn(e))}function $n(e,t){let n,r;if(Ke(e))return  -2;if(r=e.l,t<0){if(t<-16)return  -2;n=0,r.jt=-16==t,t=-t;}else n=5+(t>>4),r.jt=false,t<48&&(t&=15);let i=r.jt?16:15;return t&&(t<8||t>i)?-2:(r.u.length>0&&r.k!=t&&(r.u=Z),r.F=n,r.k=t,Qn(e))}function Qt(e,t){let n,r;if(!e)return  -2;e.msg="";let i=-16==t;return r=Z_(e,i),e.l=r,r.o=e,r.ot=i?16191:16180,n=$n(e,t),n}function er(e){let t=e.jt?jn:Vn,n={Bt:0};if(t.Pt){let r,i,f;for(r=0;r<144;)e.zt[r++]=8;for(;r<256;)e.zt[r++]=9;for(;r<280;)e.zt[r++]=7;for(;r<288;)e.zt[r++]=8;for(let e=0;e<544;e++)t.Xt[e]=pe();f=t.Xt,t.Ft=f,i=9;let _={Bt:f},l={Bt:i},o={Bt:0};for(Oe(1,e.zt,288,_,l,e.Mt,o,e.jt),f=_.Bt,i=l.Bt,e.Zt=o.Bt,r=0;r<32;)e.zt[r++]=5;i=5;let u=o.Bt,a={Bt:f},c={Bt:i};n.Bt=u,Oe(2,e.zt,32,a,c,e.Mt,n,e.jt),t.Ht=f.slice(u),t.Pt=false;}e.et=t.Ft,e.nt=9,e.tt=t.Ht,e.rt=5,e.Zt=n.Bt;}function _r(e,t,n){let r=e.l;if(!(r.u&&0!=r.u.length||(r.u=new x(1<<r.k),r.u)))return 1;if(0==r.h&&(r.h=1<<r.k,r.m=0,r.v=0),n>=r.h)M(r.u,0,t,t.length-r.h,r.h),r.m=0,r.v=r.h;else {let e=r.h-r.m;e>n&&(e=n),M(r.u,r.m,t,t.length-n,e),(n-=e)?(M(r.u,0,t,t.length-n,n),r.m=n,r.v=r.h):(r.m+=e,r.m==r.h&&(r.m=0),r.v<r.h&&(r.v+=e));}return 0}var x_=class extends R{constructor(){super("Need more input");}};function $t(e,t){let n,r,i,f,_,l,o,u,a,c,s,d,h,w,k,b,g,v=new x(4);if(Ke(e)||!e.next_out||!e.next_in&&0!=e.avail_in)return  -2;l=0,u=0,o=0,a=0,r=Z,i=0,f=Z,_=0,n=e.l,16191==n.ot&&(n.ot=16192),z(),c=l,s=o,g=0;try{for(;;)switch(n.ot){case 16180:if(0==n.F){n.ot=16192;break}if(Q(16),2&n.F&&35615==u){0==n.k&&(n.k=15),n.ht=W(0),n.ht=p(n.ht,u),N(),n.ot=16181;break}if(n.H&&(n.H.Yt=-1),!(1&n.F)||((S(8)<<8)+(u>>8))%31){e.msg="incorrect header check",n.ot=16209;break}if(8!=S(4)){e.msg="unknown compression method",n.ot=16209;break}if(D(4),b=S(4)+8,0==n.k&&(n.k=b),b>15||b>n.k){e.msg="invalid window size",n.ot=16209;break}n.dt=1<<b,n.st=0,e.i=n.ht=se(0),n.ot=512&u?16189:16191,N();break;case 16181:if(Q(16),n.st=u,8!=(255&n.st)){e.msg="unknown compression method",n.ot=16209;break}if(57344&n.st){e.msg="unknown header flags set",n.ot=16209;break}n.H&&(n.H.Ye=u>>8&1),512&n.st&&4&n.F&&(n.ht=p(n.ht,u)),N(),n.ot=16182;case 16182:Q(32),n.H&&(n.H.Ve=u),512&n.st&&4&n.F&&(n.ht=L(n.ht,u)),N(),n.ot=16183;case 16183:Q(16),n.H&&(n.H.Jt=255&u,n.H.Ce=u>>8),512&n.st&&4&n.F&&(n.ht=p(n.ht,u)),N(),n.ot=16184;case 16184:1024&n.st?(Q(16),n.kt=u,n.H&&(n.H.Ge=u),512&n.st&&4&n.F&&(n.ht=p(n.ht,u)),N()):n.H&&(n.H.Je=Z),n.ot=16185;case 16185:if(1024&n.st&&(d=n.kt,d>l&&(d=l),d&&(n.H&&n.H.Je&&n.H.Kt&&(b=n.H.Ge-n.kt)<n.H.Kt&&M(n.H.Je,b,r,i,d),512&n.st&&4&n.F&&(n.ht=W(n.ht,r.subarray(i,i+d),d)),l-=d,i+=d,n.kt-=d),n.kt))return m();n.kt=0,n.ot=16186;case 16186:if(2048&n.st){if(0==l)return m();d=0;do{b=r[i+d++],n.H&&n.H.Rt&&n.kt<n.H.Rt&&(n.H.Ke[n.kt++]=b);}while(b&&d<l);if(512&n.st&&4&n.F&&(n.ht=W(n.ht,r.subarray(i,i+d),d)),l-=d,i+=d,b)return m()}else n.H&&(n.H.Ke=Z);n.kt=0,n.ot=16187;case 16187:if(4096&n.st){if(0==l)return m();d=0;do{b=r[i+d++],n.H&&n.H.Vt&&n.kt<n.H.Vt&&(n.H.Re[n.kt++]=b);}while(b&&d<l);if(512&n.st&&4&n.F&&(n.ht=W(n.ht,r.subarray(i,i+d),d)),l-=d,i+=d,b)return m()}else n.H&&(n.H.Re=Z);n.ot=16188;case 16188:if(512&n.st){if(Q(16),4&n.F&&u!=(65535&n.ht)){e.msg="header crc mismatch",n.ot=16209;break}N();}n.H&&(n.H.He=n.st>>9&1,n.H.Yt=1),e.i=n.ht=W(0),n.ot=16191;break;case 16189:Q(32),e.i=n.ht=M_(u),N(),n.ot=16190;case 16190:if(!n.ct)return E(),2;e.i=n.ht=se(0),n.ot=16191;case 16191:if(5==t||6==t)return m();case 16192:if(n.ut){$(),n.ot=16206;break}switch(Q(3),n.ut=!!S(1),D(1),S(2)){case 0:n.ot=16193;break;case 1:if(er(n),n.ot=16199,6==t)return D(2),m();break;case 2:n.ot=16196;break;case 3:e.msg="invalid block type",n.ot=16209;}D(2);break;case 16193:if($(),Q(32),(65535&u)!=(u>>>16^65535)){e.msg="invalid stored block lengths",n.ot=16209;break}if(n.kt=65535&u,N(),n.ot=16194,6==t)return m();case 16194:n.ot=16195;case 16195:if(d=n.kt,d){if(d>l&&(d=l),d>o&&(d=o),0==d)return m();M(f,_,r,i,d),l-=d,i+=d,o-=d,_+=d,n.kt-=d;break}n.ot=16191;break;case 16196:if(Q(14),n.vt=S(5)+257,D(5),n.xt=S(5)+1,D(5),n.gt=S(4)+4,D(4),n.vt>286||!n.jt&&n.xt>30){e.msg=n.jt?"too many length":"too many length or distance symbols",n.ot=16209;break}n.yt=0,n.ot=16197;case 16197:for(;n.yt<n.gt;)Q(3),n.zt[Se[n.yt++]]=S(3),D(3);for(;n.yt<19;)n.zt[Se[n.yt++]]=0;n.Lt=n.Et,n.et=n.tt=n.Lt,n.nt=7;let c={Bt:n.Lt},v={Bt:n.nt},x={Bt:0};if(g=Oe(0,n.zt,19,c,v,n.Mt,x,n.jt),n.Lt=c.Bt,n.nt=v.Bt,g){e.msg="invalid code lengths set",n.ot=16209;break}n.yt=0,n.ot=16198;case 16198:for(;n.yt<n.vt+n.xt;){for(;w=n.et[S(n.nt)],!(w.ft<=a);)j();if(w.lt<16)D(w.ft),n.zt[n.yt++]=w.lt;else {if(16==w.lt){if(Q(w.ft+2),D(w.ft),0==n.yt){e.msg="invalid bit length repeat",n.ot=16209;break}b=n.zt[n.yt-1],d=3+S(2),D(2);}else 17==w.lt?(Q(w.ft+3),D(w.ft),b=0,d=3+S(3),D(3)):(Q(w.ft+7),D(w.ft),b=0,d=11+S(7),D(7));if(n.yt+d>n.vt+n.xt){e.msg="invalid bit length repeat",n.ot=16209;break}for(;d--;)n.zt[n.yt++]=b;}}if(16209==n.ot)break;if(0==n.zt[256]){e.msg="invalid code -- missing end-of-block",n.ot=16209;break}n.Lt=n.Et,n.nt=9;let q={Bt:n.Lt},T={Bt:n.nt},A={Bt:0};g=Oe(1,n.zt,n.vt,q,T,n.Mt,A,n.jt),n.Lt=q.Bt,n.nt=T.Bt;let O=A.Bt;if(n.et=n.Lt.slice(0,O),g){e.msg="invalid literal/lengths set",n.ot=16209;break}n.rt=6;let I=n.zt.subarray(n.vt,n.vt+n.xt),U={Bt:n.Lt},B={Bt:n.rt},P={Bt:O};if(g=Oe(2,I,n.xt,U,B,n.Mt,P,n.jt),n.Lt=U.Bt,n.rt=B.Bt,n.tt=n.Lt.slice(O),g){e.msg="invalid distances set",n.ot=16209;break}if(n.ot=16199,6==t)return m();case 16199:n.ot=16200;case 16200:if(!n.jt&&l>=6&&o>=258){E(),Vt(e,s),z(),16191==n.ot&&(n.Wt=-1);break}for(n.Wt=0;w=n.et[S(n.nt)],!(w.ft<=a);)j();if(w._t&&!(240&w._t)){for(k=w;w=n.et[k.lt+(S(k.ft+k._t)>>k.ft)],!(k.ft+w.ft<=a);)j();D(k.ft),n.Wt+=k.ft;}if(D(w.ft),n.Wt+=w.ft,n.kt=w.lt,0==w._t){n.ot=16205;break}if(32&w._t){n.Wt=-1,n.ot=16191;break}if(64&w._t){e.msg="invalid literal/length code",n.ot=16209;break}n.Je=w._t&(n.jt?31:15),n.ot=16201;case 16201:n.Je&&(Q(n.Je),n.kt+=S(n.Je),D(n.Je),n.Wt+=n.Je),n.Nt=n.kt,n.ot=16202;case 16202:for(;w=n.tt[S(n.rt)],!(w.ft<=a);)j();if(!(240&w._t)){for(k=w;w=n.tt[k.lt+(S(k.ft+k._t)>>k.ft)],!(k.ft+w.ft<=a);)j();D(k.ft),n.Wt+=k.ft;}if(D(w.ft),n.Wt+=w.ft,64&w._t){e.msg="invalid distance code",n.ot=16209;break}n.bt=w.lt,n.Je=15&w._t,n.ot=16203;case 16203:n.Je&&(Q(n.Je),n.bt+=S(n.Je),D(n.Je),n.Wt+=n.Je),n.ot=16204;case 16204:if(0==o)return m();if(d=s-o,n.bt>d){if(d=n.bt-d,d>n.v&&n.it){e.msg="invalid distance too far back",n.ot=16209;break}d>n.m?(d-=n.m,h=n.h-d):h=n.m-d,d>n.kt&&(d=n.kt),d>o&&(d=o);for(let e=0;e<d;++e)f[_]=255&n.u[h],++_,++h;}else {h=_-n.bt,d=n.kt,d>o&&(d=o);for(let e=0;e<d;++e)f[_]=f[h],++_,++h;}d>o&&(d=o),o-=d,n.kt-=d,0==n.kt&&(n.ot=16200);break;case 16205:if(0==o)return m();f[_++]=n.kt,o--,n.ot=16200;break;case 16206:if(n.F){if(Q(32),s-=o,e.total_out+=s,n.wt+=s,4&n.F&&s){let t=f.subarray(_-s,_);e.i=n.ht=y(n.ht,t,s);}if(s=o,4&n.F&&(n.st?u:M_(u)>>>0)!=n.ht){e.msg="incorrect data check",n.ot=16209;break}N();}n.ot=16207;case 16207:if(n.F&&n.st){if(Q(32),4&n.F&&u!=(4294967295&n.wt)){e.msg="incorrect length check",n.ot=16209;break}N();}n.ot=16208;case 16208:return g=1,m();case 16209:return g=-3,m();case 16210:return -4;default:return -2}}catch(e){if(e instanceof x_)return m();throw e}function m(){if(E(),n.h||s!=e.avail_out&&n.ot<16209&&(n.jt?n.ot<16208:n.ot<16206)||4!=t){let t=s-e.avail_out;if(_r(e,e.next_out.subarray(e.next_out_index-t,e.next_out_index),t))return n.ot=16210,-4}return c-=e.avail_in,s-=e.avail_out,e.total_in+=c,e.total_out+=s,n.wt+=s,4&n.F&&s&&(e.i=n.ht=y(n.ht,e.next_out.subarray(e.next_out_index-s,e.next_out_index),s)),e.t=n.L+(n.ut?64:0)+(16191==n.ot?128:0)+(16199==n.ot||16194==n.ot?256:0),(0==c&&0==s&&0==g||4==t&&0==g)&&(g=-5),g}function y(e,t,r){return n.st?W(e,t,r):se(e,t,r)}function p(e,t){return v[0]=255&t,v[1]=t>>>8&255,W(e,v,2)>>>0}function L(e,t){return v[0]=255&t,v[1]=t>>>8&255,v[2]=t>>>16&255,v[3]=t>>>24&255,W(e,v,4)>>>0}function z(){f=e.next_out,_=e.next_out_index,o=e.avail_out,r=e.next_in,i=e.next_in_index,l=e.avail_in,u=n.p,a=n.L;}function E(){e.next_out=f,e.next_out_index=_,e.avail_out=o,e.next_in=r,e.next_in_index=i,e.avail_in=l,n.p=u,n.L=a;}function N(){u=0,a=0;}function j(){if(0==l)throw new x_;l--,u+=(255&r[i])<<a,i++,u>>>=0,a+=8;}function Q(e){for(;a<e;)j();}function S(e){return u&(1<<e)-1}function D(e){u>>>=e,a-=e;}function $(){u>>>=7&a,a-=7&a;}}function en(e){return Ke(e)?-2:0}var X_=65536,tr=32768,Y_=class{constructor(e=16,t=X_){this.Ct=[],this.Gt=e;for(let n=0;n<N.min(e,4);n++)this.Ct.push(new x(t));}acquire(e=X_){for(let t=this.Ct.length-1;t>=0;t--){let n=this.Ct[t];if(n.length>=e)return this.Ct.splice(t,1),n}return new x(e)}release(e){this.Ct.length<this.Gt&&this.Ct.push(e);}};function _n(e){let t=new Y_(32,X_),n=null;function r(e){try{t.release(e);}catch{}}return new U({start(){},transform(i,f){if(!n){let t=e.en(),r=e.tn(t);if(0!=r&&0!=r)throw new R("init failed: "+r);n={o:t};}let _=n.o,l=0;for(;l<i.length;){let n=N.min(i.length-l,tr),o=i.subarray(l,l+n);for(_.next_in=o,_.next_in_index=0,_.avail_in=o.length;_.avail_in>0;){let n=t.acquire(),i=false;try{_.next_out=n,_.next_out_index=0,_.avail_out=n.length;let r=e.nn(_,0),l=n.length-_.avail_out;if(l>0){let e=!1,r={rn:n.subarray(0,l),release:()=>{e||(e=!0,t.release(n));}};i=!0,f.enqueue(r);}if(0!=r&&1!=r)throw new R("process error: "+r)}finally{i||r(n);}}l+=n;}},flush(i){if(!n)return;let f=n.o;for(;;){let n=t.acquire(),_=false;try{f.next_out=n,f.next_out_index=0,f.avail_out=n.length;let r=e.nn(f,4),l=n.length-f.avail_out;if(l>0){let e=!1,r={rn:n.subarray(0,l),release:()=>{e||(e=!0,t.release(n));}};_=!0,i.enqueue(r);}if(1==r)break;if(0!=r)throw new R("finalization error: "+r)}finally{_||r(n);}}let _=e.fn(f);if(0!=_&&0!=_)throw new R("end failed: "+_)}})}function tn(){return new U({start(){},transform(e,t){try{t.enqueue(e.rn.slice(0));}finally{e.release();}},flush(){}})}function nr(e="deflate",t){let n="gzip"==e?31:"deflate-raw"==e?-15:15,r=t&&"number"==typeof t.level?t.level:-1;return _n({en:()=>Dt(),tn:e=>vt(e,r,8,n,8,0),nn:It,fn:F_})}function rr(e="deflate"){let t="gzip"==e?31:"deflate-raw"==e?-15:"deflate64-raw"==e?-16:15;return _n({en:()=>Jt(),tn:e=>Qt(e,t),nn:$t,fn:en})}var p_=class{constructor(e="deflate",t){let n=nr(e,t);this.writable=n.writable,this.readable=n.readable.pipeThrough(tn());}},S_=class{constructor(e="deflate"){let t=rr(e);this.writable=t.writable,this.readable=t.readable.pipeThrough(tn());}};

/*
 Copyright (c) 2025 Gildas Lormeau. All rights reserved.

 Redistribution and use in source and binary forms, with or without
 modification, are permitted provided that the following conditions are met:

 1. Redistributions of source code must retain the above copyright notice,
 this list of conditions and the following disclaimer.

 2. Redistributions in binary form must reproduce the above copyright
 notice, this list of conditions and the following disclaimer in
 the documentation and/or other materials provided with the distribution.

 3. The names of the authors may not be used to endorse or promote products
 derived from this software without specific prior written permission.

 THIS SOFTWARE IS PROVIDED ''AS IS'' AND ANY EXPRESSED OR IMPLIED WARRANTIES,
 INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND
 FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL JCRAFT,
 INC. OR ANY CONTRIBUTORS TO THIS SOFTWARE BE LIABLE FOR ANY DIRECT, INDIRECT,
 INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA,
 OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
 LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
 EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */


configure({
	workerURI: "./core/web-worker-native.js",
	wasmURI: null,
	CompressionStreamZlib: p_,
	DecompressionStreamZlib: S_
});

/*
 Copyright (c) 2022 Gildas Lormeau. All rights reserved.

 Redistribution and use in source and binary forms, with or without
 modification, are permitted provided that the following conditions are met:

 1. Redistributions of source code must retain the above copyright notice,
 this list of conditions and the following disclaimer.

 2. Redistributions in binary form must reproduce the above copyright 
 notice, this list of conditions and the following disclaimer in 
 the documentation and/or other materials provided with the distribution.

 3. The names of the authors may not be used to endorse or promote products
 derived from this software without specific prior written permission.

 THIS SOFTWARE IS PROVIDED ''AS IS'' AND ANY EXPRESSED OR IMPLIED WARRANTIES,
 INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND
 FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL JCRAFT,
 INC. OR ANY CONTRIBUTORS TO THIS SOFTWARE BE LIABLE FOR ANY DIRECT, INDIRECT,
 INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA,
 OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
 LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
 EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */


const ERR_ENTRY_EXISTS = "Entry filename already exists";
const ERR_READABLE_CONSUMED = "Readable stream already consumed";

class ZipEntry {

	constructor(fs, name, params, parent) {
		const zipEntry = this;
		if (fs.root && parent && parent.getChildByName(name)) {
			throw new Error(ERR_ENTRY_EXISTS);
		}
		if (!params) {
			params = {};
		}
		Object.assign(zipEntry, {
			fs,
			name,
			data: params.data,
			options: params.options,
			id: fs.entryIdCounter++,
			parent,
			children: [],
			uncompressedSize: params.uncompressedSize || 0,
			passThrough: params.passThrough
		});
		if (parent || !fs.root) {
			fs.entries[zipEntry.id] = zipEntry;
		}
		if (parent) {
			zipEntry.parent.children.push(zipEntry);
		}
	}

	moveTo(target) {
		// deprecated
		const zipEntry = this;
		zipEntry.fs.move(zipEntry, target);
	}

	getFullname() {
		return this.getRelativeName();
	}

	getRelativeName(ancestor = this.fs.root) {
		const zipEntry = this;
		let relativeName = zipEntry.name;
		let entry = zipEntry.parent;
		while (entry && entry != ancestor) {
			relativeName = (entry.name ? entry.name + "/" : "") + relativeName;
			entry = entry.parent;
		}
		return relativeName;
	}

	isDescendantOf(ancestor) {
		let entry = this.parent;
		while (entry && entry.id != ancestor.id) {
			entry = entry.parent;
		}
		return Boolean(entry);
	}

	rename(name) {
		const parent = this.parent;
		if (parent && parent.getChildByName(name)) {
			throw new Error(ERR_ENTRY_EXISTS);
		} else {
			this.name = name;
		}
	}
}

class ZipFileEntry extends ZipEntry {

	constructor(fs, name, params, parent) {
		super(fs, name, params, parent);
		const zipEntry = this;
		zipEntry.Reader = params.Reader;
		zipEntry.Writer = params.Writer;
		if (params.getData) {
			zipEntry.getData = params.getData;
		}
	}

	clone() {
		return new ZipFileEntry(this.fs, this.name, this);
	}

	async getData(writer, options = {}) {
		const zipEntry = this;
		if (!writer || (writer.constructor == zipEntry.Writer && zipEntry.data)) {
			return zipEntry.data;
		} else {
			const reader = zipEntry.reader = createReader(zipEntry.Reader, zipEntry.data, options);
			const uncompressedSize = zipEntry.data ? zipEntry.data.uncompressedSize : reader.size;
			await Promise.all([initStream(reader), initStream(writer, uncompressedSize)]);
			const { readable } = reader;
			zipEntry.uncompressedSize = reader.size;
			await readable.pipeTo(writer.writable);
			return writer.getData ? writer.getData() : writer.writable;
		}
	}

	isPasswordProtected() {
		return Boolean(this.data && this.data.encrypted);
	}

	async checkPassword(password, options = {}) {
		const zipEntry = this;
		if (zipEntry.isPasswordProtected()) {
			try {
				await zipEntry.data.getData(null, Object.assign({}, options, {
					password,
					checkPasswordOnly: true
				}));
				return true;
			} catch (error) {
				if (error.message == ERR_INVALID_PASSWORD) {
					return false;
				} else {
					throw error;
				}
			}
		} else {
			return true;
		}
	}

	getText(encoding, options) {
		return this.getData(new TextWriter(encoding), options);
	}

	getBlob(mimeType, options) {
		return this.getData(new BlobWriter(mimeType), options);
	}

	getData64URI(mimeType, options) {
		return this.getData(new Data64URIWriter(mimeType), options);
	}

	getUint8Array(options) {
		return this.getData(new Uint8ArrayWriter(), options);
	}

	getWritable(writable = new WritableStream(), options) {
		return this.getData({ writable }, options);
	}

	async getArrayBuffer(options) {
		const array = await this.getUint8Array(options);
		return array.byteOffset || array.byteLength != array.buffer.byteLength
			? array.buffer.slice(array.byteOffset, array.byteOffset + array.byteLength)
			: array.buffer;
	}

	replaceBlob(blob) {
		Object.assign(this, {
			data: blob,
			Reader: BlobReader,
			Writer: BlobWriter,
			reader: null
		});
	}

	replaceText(text) {
		Object.assign(this, {
			data: text,
			Reader: TextReader,
			Writer: TextWriter,
			reader: null
		});
	}

	replaceData64URI(dataURI) {
		Object.assign(this, {
			data: dataURI,
			Reader: Data64URIReader,
			Writer: Data64URIWriter,
			reader: null
		});
	}

	replaceUint8Array(array) {
		Object.assign(this, {
			data: array,
			Reader: Uint8ArrayReader,
			Writer: Uint8ArrayWriter,
			reader: null
		});
	}

	replaceReadable(readable) {
		Object.assign(this, {
			data: null,
			Reader: getReadableReader(readable),
			Writer: null,
			reader: null
		});
	}
}

class ZipDirectoryEntry extends ZipEntry {

	constructor(fs, name, params, parent) {
		super(fs, name, params, parent);
		this.directory = true;
	}

	clone(deepClone) {
		const zipEntry = this;
		const clonedEntry = new ZipDirectoryEntry(zipEntry.fs, zipEntry.name, zipEntry);
		if (deepClone) {
			clonedEntry.children = zipEntry.children.map(child => {
				const childClone = child.clone(deepClone);
				childClone.parent = clonedEntry;
				return childClone;
			});
		}
		return clonedEntry;
	}

	addDirectory(name, options) {
		return addChild(this, name, { options }, true);
	}

	addText(name, text, options = {}) {
		return addChild(this, name, {
			data: text,
			Reader: TextReader,
			Writer: TextWriter,
			options,
			uncompressedSize: text.length
		});
	}

	addBlob(name, blob, options = {}) {
		return addChild(this, name, {
			data: blob,
			Reader: BlobReader,
			Writer: BlobWriter,
			options,
			uncompressedSize: blob.size
		});
	}

	addData64URI(name, dataURI, options = {}) {
		let dataEnd = dataURI.length;
		while (dataURI.charAt(dataEnd - 1) == "=") {
			dataEnd--;
		}
		const dataStart = dataURI.indexOf(",") + 1;
		return addChild(this, name, {
			data: dataURI,
			Reader: Data64URIReader,
			Writer: Data64URIWriter,
			options,
			uncompressedSize: Math.floor((dataEnd - dataStart) * 0.75)
		});
	}

	addUint8Array(name, array, options = {}) {
		return addChild(this, name, {
			data: array,
			Reader: Uint8ArrayReader,
			Writer: Uint8ArrayWriter,
			options,
			uncompressedSize: array.length
		});
	}

	addHttpContent(name, url, options = {}) {
		return addChild(this, name, {
			data: url,
			Reader: class extends HttpReader {
				constructor(url) {
					super(url, options);
				}
			},
			options
		});
	}

	addReadable(name, readable, options = {}) {
		return addChild(this, name, {
			Reader: getReadableReader(readable),
			options
		});
	}

	addFileSystemEntry(fileSystemEntry, options = {}) {
		return addFileSystemHandle(this, fileSystemEntry, options);
	}

	addFileSystemHandle(handle, options = {}) {
		return addFileSystemHandle(this, handle, options);
	}

	addFile(file, options = {}) {
		options = Object.assign({}, options);
		if (!options.lastModDate) {
			options.lastModDate = new Date(file.lastModified);
		}
		return addChild(this, file.name, {
			data: file,
			Reader: function () {
				const readable = file.stream();
				const size = file.size;
				return { readable, size };
			},
			options,
			uncompressedSize: file.size
		});
	}

	addData(name, params) {
		return addChild(this, name, params);
	}

	importBlob(blob, options) {
		return this.importZip(new BlobReader(blob), options);
	}

	importData64URI(dataURI, options) {
		return this.importZip(new Data64URIReader(dataURI), options);
	}

	importUint8Array(array, options) {
		return this.importZip(new Uint8ArrayReader(array), options);
	}

	importHttpContent(url, options) {
		return this.importZip(new HttpReader(url, options), options);
	}

	importReadable(readable, options) {
		return this.importZip({ readable }, options);
	}

	exportBlob(options = {}) {
		return this.exportZip(new BlobWriter(options.mimeType || "application/zip"), options);
	}

	exportData64URI(options = {}) {
		return this.exportZip(new Data64URIWriter(options.mimeType || "application/zip"), options);
	}

	exportUint8Array(options = {}) {
		return this.exportZip(new Uint8ArrayWriter(), options);
	}

	async exportWritable(writable = new WritableStream(), options = {}) {
		await this.exportZip({ writable }, options);
		return writable;
	}

	exportFileSystemHandle(handle, options = {}) {
		return exportFileSystemHandle(this, handle, options);
	}

	async importZip(reader, options = {}) {
		await initStream(reader);
		const zipReader = new ZipReader(reader, options);
		const importedEntries = [];
		const entries = await zipReader.getEntries();
		for (const entry of entries) {
			let parent = this;
			try {
				const path = entry.filename.split("/");
				const name = path.pop();
				path.forEach(pathPart => {
					const previousParent = parent;
					parent = parent.getChildByName(pathPart);
					if (parent) {
						if (!parent.directory) {
							throw new Error(ERR_ENTRY_EXISTS);
						}
					} else {
						parent = new ZipDirectoryEntry(this.fs, pathPart, { data: null }, previousParent);
						importedEntries.push(parent);
					}
				});
				if (!entry.directory) {
					importedEntries.push(addChild(parent, name, {
						data: entry,
						Reader: getZipBlobReader(Object.assign({}, options)),
						uncompressedSize: entry.uncompressedSize,
						passThrough: options.passThrough
					}));
				} else {
					let directoryEntry = parent;
					if (name) {
						directoryEntry = parent.getChildByName(name);
						if (directoryEntry) {
							if (!directoryEntry.directory) {
								throw new Error(ERR_ENTRY_EXISTS);
							}
						} else {
							directoryEntry = new ZipDirectoryEntry(this.fs, name, { data: null }, parent);
							importedEntries.push(directoryEntry);
						}
					}
					if (directoryEntry != this && !directoryEntry.data) {
						directoryEntry.data = entry;
					}
				}
			} catch (error) {
				try {
					error.cause = {
						entry
					};
				} catch {
					// ignored
				}
				throw error;
			}
		}
		return importedEntries;
	}

	async exportZip(writer, options = {}) {
		const zipEntry = this;
		options = Object.assign({}, options);
		if (options.bufferedWrite === UNDEFINED_VALUE) {
			options.bufferedWrite = true;
		}
		const [readers] = await Promise.all([initReaders(zipEntry, options.readerOptions), initStream(writer)]);
		const zipWriter = new ZipWriter(writer, options);
		await exportZip(zipWriter, zipEntry, getTotalSize([zipEntry], "uncompressedSize"), options, readers);
		await zipWriter.close();
		return writer.getData ? writer.getData() : writer.writable;
	}

	getChildByName(name) {
		const children = this.children;
		for (let childIndex = 0; childIndex < children.length; childIndex++) {
			const child = children[childIndex];
			if (child.name == name) {
				return child;
			}
		}
	}

	isPasswordProtected() {
		const children = this.children;
		for (let childIndex = 0; childIndex < children.length; childIndex++) {
			const child = children[childIndex];
			if (child.isPasswordProtected()) {
				return true;
			}
		}
		return false;
	}

	async checkPassword(password, options = {}) {
		const children = this.children;
		const result = await Promise.all(children.map(child => child.checkPassword(password, options)));
		return !result.includes(false);
	}
}


class FS {

	constructor() {
		resetFS(this);
	}

	get children() {
		return this.root.children;
	}

	remove(entry) {
		detach(entry);
		const removedEntries = [entry];
		while (removedEntries.length) {
			const removedEntry = removedEntries.pop();
			this.entries[removedEntry.id] = null;
			for (const child of removedEntry.children) {
				removedEntries.push(child);
			}
		}
		entry.parent = UNDEFINED_VALUE;
	}

	move(entry, destination) {
		if (entry == this.root) {
			throw new Error("Root directory cannot be moved");
		} else {
			if (destination.directory) {
				if (!destination.isDescendantOf(entry)) {
					if (entry != destination) {
						const existingChild = destination.getChildByName(entry.name);
						if (existingChild) {
							if (existingChild != entry) {
								throw new Error(ERR_ENTRY_EXISTS);
							}
						} else {
							detach(entry);
							entry.parent = destination;
							destination.children.push(entry);
							registerEntries(this, entry);
						}
					}
				} else {
					throw new Error("Entry is a ancestor of target entry");
				}
			} else {
				throw new Error("Target entry is not a directory");
			}
		}
	}

	find(fullname) {
		const path = fullname.split("/");
		let node = this.root;
		for (let index = 0; node && index < path.length; index++) {
			node = node.getChildByName(path[index]);
		}
		if (!node) {
			node = this.entries.find(entry => entry && (entry == this.root || entry.isDescendantOf(this.root)) &&
				entry.getRelativeName() == fullname);
		}
		return node;
	}

	getById(id) {
		return this.entries[id];
	}

	getChildByName(name) {
		return this.root.getChildByName(name);
	}

	addDirectory(name, options) {
		return this.root.addDirectory(name, options);
	}

	addText(name, text, options) {
		return this.root.addText(name, text, options);
	}

	addBlob(name, blob, options) {
		return this.root.addBlob(name, blob, options);
	}

	addData64URI(name, dataURI, options) {
		return this.root.addData64URI(name, dataURI, options);
	}

	addUint8Array(name, array, options) {
		return this.root.addUint8Array(name, array, options);
	}

	addHttpContent(name, url, options) {
		return this.root.addHttpContent(name, url, options);
	}

	addReadable(name, readable, options) {
		return this.root.addReadable(name, readable, options);
	}

	addFileSystemEntry(fileSystemEntry, options) {
		return this.root.addFileSystemEntry(fileSystemEntry, options);
	}

	addFileSystemHandle(handle, options) {
		return this.root.addFileSystemHandle(handle, options);
	}

	addFile(file, options) {
		return this.root.addFile(file, options);
	}

	addData(name, params) {
		return this.root.addData(name, params);
	}

	importBlob(blob, options) {
		resetFS(this);
		return this.root.importBlob(blob, options);
	}

	importData64URI(dataURI, options) {
		resetFS(this);
		return this.root.importData64URI(dataURI, options);
	}

	importUint8Array(array, options) {
		resetFS(this);
		return this.root.importUint8Array(array, options);
	}

	importHttpContent(url, options) {
		resetFS(this);
		return this.root.importHttpContent(url, options);
	}

	importReadable(readable, options) {
		resetFS(this);
		return this.root.importReadable(readable, options);
	}

	importZip(reader, options) {
		resetFS(this);
		return this.root.importZip(reader, options);
	}

	exportBlob(options) {
		return this.root.exportBlob(options);
	}

	exportData64URI(options) {
		return this.root.exportData64URI(options);
	}

	exportUint8Array(options) {
		return this.root.exportUint8Array(options);
	}

	exportWritable(writable, options) {
		return this.root.exportWritable(writable, options);
	}

	exportFileSystemHandle(handle, options) {
		return this.root.exportFileSystemHandle(handle, options);
	}

	exportZip(writer, options) {
		return this.root.exportZip(writer, options);
	}

	isPasswordProtected() {
		return this.root.isPasswordProtected();
	}

	checkPassword(password, options) {
		return this.root.checkPassword(password, options);
	}
}

const fs = { FS, ZipDirectoryEntry, ZipFileEntry };

function getTotalSize(entries, propertyName) {
	let size = 0;
	const pendingEntries = Array.from(entries);
	while (pendingEntries.length) {
		const entry = pendingEntries.pop();
		size += entry[propertyName] || 0;
		for (const child of entry.children) {
			pendingEntries.push(child);
		}
	}
	return size;
}

function getReadableReader(readable) {
	let consumed;
	return function () {
		if (consumed) {
			throw new Error(ERR_READABLE_CONSUMED);
		}
		consumed = true;
		return { readable };
	};
}

function getZipBlobReader(options) {
	return class extends Reader {

		constructor(entry, options = {}) {
			super();
			this.entry = entry;
			this.options = options;
		}

		async init() {
			const zipBlobReader = this;
			zipBlobReader.size = zipBlobReader.entry.uncompressedSize;
			const data = await zipBlobReader.entry.getData(new BlobWriter(), Object.assign({}, options, zipBlobReader.options));
			zipBlobReader.data = data;
			zipBlobReader.blobReader = new BlobReader(data);
			super.init();
		}

		readUint8Array(index, length) {
			return this.blobReader.readUint8Array(index, length);
		}
	};
}

function createReader(Reader, data, options) {
	return Reader.prototype ? new Reader(data, options) : Reader(data, options);
}

async function initReaders(entry, options) {
	const fileEntries = [];
	const pendingEntries = [entry];
	const readers = new Map();
	while (pendingEntries.length) {
		const pendingEntry = pendingEntries.pop();
		for (const child of pendingEntry.children) {
			if (child.directory) {
				pendingEntries.push(child);
			} else {
				fileEntries.push(child);
			}
		}
	}
	await Promise.all(fileEntries.map(async child => {
		const reader = child.reader = createReader(child.Reader, child.data, options);
		readers.set(child, reader);
		try {
			await initStream(reader);
		} catch (error) {
			try {
				error.entryId = child.id;
				error.cause = {
					entry: child
				};
			} catch {
				// ignored
			}
			throw error;
		}
		if (reader.size !== UNDEFINED_VALUE) {
			child.uncompressedSize = reader.size;
		}
	}));
	return readers;
}

function detach(entry) {
	if (entry.parent) {
		const children = entry.parent.children;
		children.forEach((child, index) => {
			if (child.id == entry.id) {
				children.splice(index, 1);
			}
		});
	}
}

async function exportZip(zipWriter, entry, totalSize, options, readers) {
	const selectedEntry = entry;
	const entryOffsets = new Map();
	await process(zipWriter, entry);

	async function process(zipWriter, entry) {
		await exportChild();

		async function exportChild() {
			if (options.bufferedWrite) {
				const results = await Promise.allSettled(entry.children.map(processChild));
				const errorResult = results.find(result => result.status == "rejected");
				if (errorResult) {
					throw errorResult.reason;
				}
			} else {
				for (const child of entry.children) {
					await processChild(child);
				}
			}
		}

		async function processChild(child) {
			const name = options.relativePath ? child.getRelativeName(selectedEntry) : child.getFullname();
			const childOptions = child.options || {};
			let zipEntryOptions = {};
			if (child.data instanceof Entry) {
				const {
					externalFileAttributes,
					versionMadeBy,
					comment,
					lastModDate,
					creationDate,
					lastAccessDate,
					uncompressedSize,
					encrypted,
					zipCrypto,
					signature,
					compressionMethod,
					extraFieldAES
				} = child.data;
				zipEntryOptions = {
					externalFileAttributes,
					versionMadeBy,
					comment,
					lastModDate,
					creationDate,
					lastAccessDate
				};
				if (child.passThrough) {
					let level, encryptionStrength;
					if (compressionMethod === 0) {
						level = 0;
					}
					if (extraFieldAES) {
						encryptionStrength = extraFieldAES.strength;
					}
					zipEntryOptions = Object.assign(zipEntryOptions, {
						passThrough: true,
						encrypted,
						zipCrypto,
						signature,
						uncompressedSize,
						level,
						encryptionStrength,
						compressionMethod
					});
				}
			}
			await zipWriter.add(name, readers.get(child), Object.assign({}, options, zipEntryOptions, childOptions, {
				directory: child.directory,
				onprogress: async indexProgress => {
					if (options.onprogress) {
						entryOffsets.set(name, indexProgress);
						try {
							await options.onprogress(Array.from(entryOffsets.values()).reduce((previousValue, currentValue) => previousValue + currentValue), totalSize);
						} catch {
							// ignored
						}
					}
				}
			}));
			await process(zipWriter, child);
		}
	}
}

function addFileSystemHandle(zipEntry, handle, options) {
	return addFile(zipEntry, handle, []);

	async function addFile(parentEntry, handle, addedEntries) {
		if (handle) {
			try {
				if (handle.isFile || handle.isDirectory) {
					handle = await transformToFileSystemhandle(handle);
				}
				if (handle.kind == "file") {
					const file = await handle.getFile();
					addedEntries.push(
						parentEntry.addData(file.name, {
							Reader: function () {
								const readable = file.stream();
								const size = file.size;
								return { readable, size };
							},
							options: Object.assign({}, { lastModDate: new Date(file.lastModified) }, options),
							uncompressedSize: file.size
						})
					);
				} else if (handle.kind == "directory") {
					const directoryEntry = parentEntry.addDirectory(handle.name);
					addedEntries.push(directoryEntry);
					for await (const childHandle of handle.values()) {
						await addFile(directoryEntry, childHandle, addedEntries);
					}
				}
			} catch (error) {
				const message = error.message + (handle ? " (" + handle.name + ")" : "");
				throw new Error(message, { cause: error });
			}
		}
		return addedEntries;
	}
}

async function exportFileSystemHandle(zipEntry, directoryHandle, options) {
	const totalSize = getTotalSize([zipEntry], "uncompressedSize");
	const writtenSizes = new Map();
	await exportChildren(zipEntry, directoryHandle);
	return directoryHandle;

	async function exportChildren(entry, parentHandle) {
		if (options.concurrent) {
			const results = await Promise.allSettled(entry.children.map(child => exportChild(child, parentHandle)));
			const failedResult = results.find(result => result.status == "rejected");
			if (failedResult) {
				throw failedResult.reason;
			}
		} else {
			for (const child of entry.children) {
				await exportChild(child, parentHandle);
			}
		}
	}

	async function exportChild(child, parentHandle) {
		try {
			if (child.directory) {
				const childDirectoryHandle = await parentHandle.getDirectoryHandle(child.name, { create: true });
				await exportChildren(child, childDirectoryHandle);
			} else {
				const fileHandle = await parentHandle.getFileHandle(child.name, { create: true });
				const writable = await fileHandle.createWritable();
				await child.getData({ writable }, Object.assign({}, options, {
					onprogress: async progress => {
						if (options.onprogress) {
							writtenSizes.set(child.id, progress);
							try {
								await options.onprogress(Array.from(writtenSizes.values()).reduce((previousValue, currentValue) => previousValue + currentValue, 0), totalSize);
							} catch {
								// ignored
							}
						}
					}
				}));
			}
		} catch (error) {
			throw new Error(error.message + (child ? " (" + child.name + ")" : ""), { cause: error });
		}
	}
}

async function transformToFileSystemhandle(entry) {
	const handle = {
		name: entry.name
	};
	if (entry.isFile) {
		handle.kind = "file";
		handle.getFile = () =>
			new Promise((resolve, reject) => entry.file(resolve, reject));
	}
	if (entry.isDirectory) {
		handle.kind = "directory";
		const handles = await transformToFileSystemhandles(entry);
		handle.values = () => handles;
	}
	return handle;
}

async function transformToFileSystemhandles(entry) {
	const entries = [];
	function readEntries(directoryReader, resolve, reject) {
		directoryReader.readEntries(async (entriesPart) => {
			if (!entriesPart.length) {
				resolve(entries);
			} else {
				for (const entry of entriesPart) {
					entries.push(await transformToFileSystemhandle(entry));
				}
				readEntries(directoryReader, resolve, reject);
			}
		}, reject);
	}
	await new Promise((resolve, reject) =>
		readEntries(entry.createReader(), resolve, reject)
	);
	return {
		[Symbol.iterator]() {
			let entryIndex = 0;
			return {
				next() {
					const result = {
						value: entries[entryIndex],
						done: entryIndex == entries.length
					};
					entryIndex++;
					return result;
				}
			};
		}
	};
}

function resetFS(fs) {
	fs.entries = [];
	fs.entryIdCounter = 0;
	fs.root = new ZipDirectoryEntry(fs);
}

function registerEntries(fs, entry) {
	const pendingEntries = [entry];
	while (pendingEntries.length) {
		const pendingEntry = pendingEntries.pop();
		fs.entries[pendingEntry.id] = pendingEntry;
		for (const child of pendingEntry.children) {
			pendingEntries.push(child);
		}
	}
}

function addChild(parent, name, params, directory) {
	if (parent.directory) {
		return directory ? new ZipDirectoryEntry(parent.fs, name, params, parent) : new ZipFileEntry(parent.fs, name, params, parent);
	} else {
		throw new Error("Parent entry is not a directory");
	}
}

/*
 Copyright (c) 2022 Gildas Lormeau. All rights reserved.

 Redistribution and use in source and binary forms, with or without
 modification, are permitted provided that the following conditions are met:

 1. Redistributions of source code must retain the above copyright notice,
 this list of conditions and the following disclaimer.

 2. Redistributions in binary form must reproduce the above copyright 
 notice, this list of conditions and the following disclaimer in 
 the documentation and/or other materials provided with the distribution.

 3. The names of the authors may not be used to endorse or promote products
 derived from this software without specific prior written permission.

 THIS SOFTWARE IS PROVIDED ''AS IS'' AND ANY EXPRESSED OR IMPLIED WARRANTIES,
 INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND
 FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL JCRAFT,
 INC. OR ANY CONTRIBUTORS TO THIS SOFTWARE BE LIABLE FOR ANY DIRECT, INDIRECT,
 INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA,
 OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
 LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
 EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */


const table = {
	"application": {
		"andrew-inset": "ez",
		"annodex": "anx",
		"atom+xml": "atom",
		"atomcat+xml": "atomcat",
		"atomserv+xml": "atomsrv",
		"bbolin": "lin",
		"cu-seeme": "cu",
		"davmount+xml": "davmount",
		"dsptype": "tsp",
		"ecmascript": [
			"es",
			"ecma"
		],
		"futuresplash": "spl",
		"hta": "hta",
		"java-archive": "jar",
		"java-serialized-object": "ser",
		"java-vm": "class",
		"m3g": "m3g",
		"mac-binhex40": "hqx",
		"mathematica": [
			"nb",
			"ma",
			"mb"
		],
		"msaccess": "mdb",
		"msword": [
			"doc",
			"dot",
			"wiz"
		],
		"mxf": "mxf",
		"oda": "oda",
		"ogg": "ogx",
		"pdf": "pdf",
		"pgp-keys": "key",
		"pgp-signature": [
			"asc",
			"sig"
		],
		"pics-rules": "prf",
		"postscript": [
			"ps",
			"ai",
			"eps",
			"epsi",
			"epsf",
			"eps2",
			"eps3"
		],
		"rar": "rar",
		"rdf+xml": "rdf",
		"rss+xml": "rss",
		"rtf": "rtf",
		"xhtml+xml": [
			"xhtml",
			"xht"
		],
		"xml": [
			"xml",
			"xsl",
			"xsd",
			"xpdl"
		],
		"xspf+xml": "xspf",
		"zip": "zip",
		"vnd.android.package-archive": "apk",
		"vnd.cinderella": "cdy",
		"vnd.google-earth.kml+xml": "kml",
		"vnd.google-earth.kmz": "kmz",
		"vnd.mozilla.xul+xml": "xul",
		"vnd.ms-excel": [
			"xls",
			"xlb",
			"xlt",
			"xlm",
			"xla",
			"xlc",
			"xlw"
		],
		"vnd.ms-pki.seccat": "cat",
		"vnd.ms-pki.stl": "stl",
		"vnd.ms-powerpoint": [
			"ppt",
			"pps",
			"pot",
			"ppa",
			"pwz"
		],
		"vnd.oasis.opendocument.chart": "odc",
		"vnd.oasis.opendocument.database": "odb",
		"vnd.oasis.opendocument.formula": "odf",
		"vnd.oasis.opendocument.graphics": "odg",
		"vnd.oasis.opendocument.graphics-template": "otg",
		"vnd.oasis.opendocument.image": "odi",
		"vnd.oasis.opendocument.presentation": "odp",
		"vnd.oasis.opendocument.presentation-template": "otp",
		"vnd.oasis.opendocument.spreadsheet": "ods",
		"vnd.oasis.opendocument.spreadsheet-template": "ots",
		"vnd.oasis.opendocument.text": "odt",
		"vnd.oasis.opendocument.text-master": [
			"odm",
			"otm"
		],
		"vnd.oasis.opendocument.text-template": "ott",
		"vnd.oasis.opendocument.text-web": "oth",
		"vnd.openxmlformats-officedocument.spreadsheetml.sheet": "xlsx",
		"vnd.openxmlformats-officedocument.spreadsheetml.template": "xltx",
		"vnd.openxmlformats-officedocument.presentationml.presentation": "pptx",
		"vnd.openxmlformats-officedocument.presentationml.slideshow": "ppsx",
		"vnd.openxmlformats-officedocument.presentationml.template": "potx",
		"vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
		"vnd.openxmlformats-officedocument.wordprocessingml.template": "dotx",
		"vnd.smaf": "mmf",
		"vnd.stardivision.calc": "sdc",
		"vnd.stardivision.chart": "sds",
		"vnd.stardivision.draw": "sda",
		"vnd.stardivision.impress": "sdd",
		"vnd.stardivision.math": [
			"sdf",
			"smf"
		],
		"vnd.stardivision.writer": [
			"sdw",
			"vor"
		],
		"vnd.stardivision.writer-global": "sgl",
		"vnd.sun.xml.calc": "sxc",
		"vnd.sun.xml.calc.template": "stc",
		"vnd.sun.xml.draw": "sxd",
		"vnd.sun.xml.draw.template": "std",
		"vnd.sun.xml.impress": "sxi",
		"vnd.sun.xml.impress.template": "sti",
		"vnd.sun.xml.math": "sxm",
		"vnd.sun.xml.writer": "sxw",
		"vnd.sun.xml.writer.global": "sxg",
		"vnd.sun.xml.writer.template": "stw",
		"vnd.symbian.install": [
			"sis",
			"sisx"
		],
		"vnd.visio": [
			"vsd",
			"vst",
			"vss",
			"vsw",
			"vsdx",
			"vssx",
			"vstx",
			"vssm",
			"vstm"
		],
		"vnd.wap.wbxml": "wbxml",
		"vnd.wap.wmlc": "wmlc",
		"vnd.wap.wmlscriptc": "wmlsc",
		"vnd.wordperfect": "wpd",
		"vnd.wordperfect5.1": "wp5",
		"x-123": "wk",
		"x-7z-compressed": "7z",
		"x-abiword": "abw",
		"x-apple-diskimage": "dmg",
		"x-bcpio": "bcpio",
		"x-bittorrent": "torrent",
		"x-cbr": [
			"cbr",
			"cba",
			"cbt",
			"cb7"
		],
		"x-cbz": "cbz",
		"x-cdf": [
			"cdf",
			"cda"
		],
		"x-cdlink": "vcd",
		"x-chess-pgn": "pgn",
		"x-cpio": "cpio",
		"x-csh": "csh",
		"x-director": [
			"dir",
			"dxr",
			"cst",
			"cct",
			"cxt",
			"w3d",
			"fgd",
			"swa"
		],
		"x-dms": "dms",
		"x-doom": "wad",
		"x-dvi": "dvi",
		"x-httpd-eruby": "rhtml",
		"x-freemind": "mm",
		"x-gnumeric": "gnumeric",
		"x-go-sgf": "sgf",
		"x-graphing-calculator": "gcf",
		"x-gtar": [
			"gtar",
			"taz"
		],
		"x-hdf": "hdf",
		"x-httpd-php": [
			"phtml",
			"pht",
			"php"
		],
		"x-httpd-php-source": "phps",
		"x-httpd-php3": "php3",
		"x-httpd-php3-preprocessed": "php3p",
		"x-httpd-php4": "php4",
		"x-httpd-php5": "php5",
		"x-ica": "ica",
		"x-info": "info",
		"x-internet-signup": [
			"ins",
			"isp"
		],
		"x-iphone": "iii",
		"x-iso9660-image": "iso",
		"x-java-jnlp-file": "jnlp",
		"x-jmol": "jmz",
		"x-killustrator": "kil",
		"x-latex": "latex",
		"x-lyx": "lyx",
		"x-lzx": "lzx",
		"x-maker": [
			"frm",
			"fb",
			"fbdoc"
		],
		"x-ms-wmd": "wmd",
		"x-msdos-program": [
			"com",
			"exe",
			"bat",
			"dll"
		],
		"x-netcdf": [
			"nc"
		],
		"x-ns-proxy-autoconfig": [
			"pac",
			"dat"
		],
		"x-nwc": "nwc",
		"x-object": "o",
		"x-oz-application": "oza",
		"x-pkcs7-certreqresp": "p7r",
		"x-python-code": [
			"pyc",
			"pyo"
		],
		"x-qgis": [
			"qgs",
			"shp",
			"shx"
		],
		"x-quicktimeplayer": "qtl",
		"x-redhat-package-manager": [
			"rpm",
			"rpa"
		],
		"x-ruby": "rb",
		"x-sh": "sh",
		"x-shar": "shar",
		"x-shockwave-flash": [
			"swf",
			"swfl"
		],
		"x-silverlight": "scr",
		"x-stuffit": "sit",
		"x-sv4cpio": "sv4cpio",
		"x-sv4crc": "sv4crc",
		"x-tar": "tar",
		"x-tex-gf": "gf",
		"x-tex-pk": "pk",
		"x-texinfo": [
			"texinfo",
			"texi"
		],
		"x-trash": [
			"~",
			"%",
			"bak",
			"old",
			"sik"
		],
		"x-ustar": "ustar",
		"x-wais-source": "src",
		"x-wingz": "wz",
		"x-x509-ca-cert": [
			"crt",
			"der",
			"cer"
		],
		"x-xcf": "xcf",
		"x-xfig": "fig",
		"x-xpinstall": "xpi",
		"applixware": "aw",
		"atomsvc+xml": "atomsvc",
		"ccxml+xml": "ccxml",
		"cdmi-capability": "cdmia",
		"cdmi-container": "cdmic",
		"cdmi-domain": "cdmid",
		"cdmi-object": "cdmio",
		"cdmi-queue": "cdmiq",
		"docbook+xml": "dbk",
		"dssc+der": "dssc",
		"dssc+xml": "xdssc",
		"emma+xml": "emma",
		"epub+zip": "epub",
		"exi": "exi",
		"font-tdpfr": "pfr",
		"gml+xml": "gml",
		"gpx+xml": "gpx",
		"gxf": "gxf",
		"hyperstudio": "stk",
		"inkml+xml": [
			"ink",
			"inkml"
		],
		"ipfix": "ipfix",
		"jsonml+json": "jsonml",
		"lost+xml": "lostxml",
		"mads+xml": "mads",
		"marc": "mrc",
		"marcxml+xml": "mrcx",
		"mathml+xml": [
			"mathml",
			"mml"
		],
		"mbox": "mbox",
		"mediaservercontrol+xml": "mscml",
		"metalink+xml": "metalink",
		"metalink4+xml": "meta4",
		"mets+xml": "mets",
		"mods+xml": "mods",
		"mp21": [
			"m21",
			"mp21"
		],
		"mp4": "mp4s",
		"oebps-package+xml": "opf",
		"omdoc+xml": "omdoc",
		"onenote": [
			"onetoc",
			"onetoc2",
			"onetmp",
			"onepkg"
		],
		"oxps": "oxps",
		"patch-ops-error+xml": "xer",
		"pgp-encrypted": "pgp",
		"pkcs10": "p10",
		"pkcs7-mime": [
			"p7m",
			"p7c"
		],
		"pkcs7-signature": "p7s",
		"pkcs8": "p8",
		"pkix-attr-cert": "ac",
		"pkix-crl": "crl",
		"pkix-pkipath": "pkipath",
		"pkixcmp": "pki",
		"pls+xml": "pls",
		"prs.cww": "cww",
		"pskc+xml": "pskcxml",
		"reginfo+xml": "rif",
		"relax-ng-compact-syntax": "rnc",
		"resource-lists+xml": "rl",
		"resource-lists-diff+xml": "rld",
		"rls-services+xml": "rs",
		"rpki-ghostbusters": "gbr",
		"rpki-manifest": "mft",
		"rpki-roa": "roa",
		"rsd+xml": "rsd",
		"sbml+xml": "sbml",
		"scvp-cv-request": "scq",
		"scvp-cv-response": "scs",
		"scvp-vp-request": "spq",
		"scvp-vp-response": "spp",
		"sdp": "sdp",
		"set-payment-initiation": "setpay",
		"set-registration-initiation": "setreg",
		"shf+xml": "shf",
		"sparql-query": "rq",
		"sparql-results+xml": "srx",
		"srgs": "gram",
		"srgs+xml": "grxml",
		"sru+xml": "sru",
		"ssdl+xml": "ssdl",
		"ssml+xml": "ssml",
		"tei+xml": [
			"tei",
			"teicorpus"
		],
		"thraud+xml": "tfi",
		"timestamped-data": "tsd",
		"vnd.3gpp.pic-bw-large": "plb",
		"vnd.3gpp.pic-bw-small": "psb",
		"vnd.3gpp.pic-bw-var": "pvb",
		"vnd.3gpp2.tcap": "tcap",
		"vnd.3m.post-it-notes": "pwn",
		"vnd.accpac.simply.aso": "aso",
		"vnd.accpac.simply.imp": "imp",
		"vnd.acucobol": "acu",
		"vnd.acucorp": [
			"atc",
			"acutc"
		],
		"vnd.adobe.air-application-installer-package+zip": "air",
		"vnd.adobe.formscentral.fcdt": "fcdt",
		"vnd.adobe.fxp": [
			"fxp",
			"fxpl"
		],
		"vnd.adobe.xdp+xml": "xdp",
		"vnd.adobe.xfdf": "xfdf",
		"vnd.ahead.space": "ahead",
		"vnd.airzip.filesecure.azf": "azf",
		"vnd.airzip.filesecure.azs": "azs",
		"vnd.amazon.ebook": "azw",
		"vnd.americandynamics.acc": "acc",
		"vnd.amiga.ami": "ami",
		"vnd.anser-web-certificate-issue-initiation": "cii",
		"vnd.anser-web-funds-transfer-initiation": "fti",
		"vnd.antix.game-component": "atx",
		"vnd.apple.installer+xml": "mpkg",
		"vnd.apple.mpegurl": "m3u8",
		"vnd.aristanetworks.swi": "swi",
		"vnd.astraea-software.iota": "iota",
		"vnd.audiograph": "aep",
		"vnd.blueice.multipass": "mpm",
		"vnd.bmi": "bmi",
		"vnd.businessobjects": "rep",
		"vnd.chemdraw+xml": "cdxml",
		"vnd.chipnuts.karaoke-mmd": "mmd",
		"vnd.claymore": "cla",
		"vnd.cloanto.rp9": "rp9",
		"vnd.clonk.c4group": [
			"c4g",
			"c4d",
			"c4f",
			"c4p",
			"c4u"
		],
		"vnd.cluetrust.cartomobile-config": "c11amc",
		"vnd.cluetrust.cartomobile-config-pkg": "c11amz",
		"vnd.commonspace": "csp",
		"vnd.contact.cmsg": "cdbcmsg",
		"vnd.cosmocaller": "cmc",
		"vnd.crick.clicker": "clkx",
		"vnd.crick.clicker.keyboard": "clkk",
		"vnd.crick.clicker.palette": "clkp",
		"vnd.crick.clicker.template": "clkt",
		"vnd.crick.clicker.wordbank": "clkw",
		"vnd.criticaltools.wbs+xml": "wbs",
		"vnd.ctc-posml": "pml",
		"vnd.cups-ppd": "ppd",
		"vnd.curl.car": "car",
		"vnd.curl.pcurl": "pcurl",
		"vnd.dart": "dart",
		"vnd.data-vision.rdz": "rdz",
		"vnd.dece.data": [
			"uvf",
			"uvvf",
			"uvd",
			"uvvd"
		],
		"vnd.dece.ttml+xml": [
			"uvt",
			"uvvt"
		],
		"vnd.dece.unspecified": [
			"uvx",
			"uvvx"
		],
		"vnd.dece.zip": [
			"uvz",
			"uvvz"
		],
		"vnd.denovo.fcselayout-link": "fe_launch",
		"vnd.dna": "dna",
		"vnd.dolby.mlp": "mlp",
		"vnd.dpgraph": "dpg",
		"vnd.dreamfactory": "dfac",
		"vnd.ds-keypoint": "kpxx",
		"vnd.dvb.ait": "ait",
		"vnd.dvb.service": "svc",
		"vnd.dynageo": "geo",
		"vnd.ecowin.chart": "mag",
		"vnd.enliven": "nml",
		"vnd.epson.esf": "esf",
		"vnd.epson.msf": "msf",
		"vnd.epson.quickanime": "qam",
		"vnd.epson.salt": "slt",
		"vnd.epson.ssf": "ssf",
		"vnd.eszigno3+xml": [
			"es3",
			"et3"
		],
		"vnd.ezpix-album": "ez2",
		"vnd.ezpix-package": "ez3",
		"vnd.fdf": "fdf",
		"vnd.fdsn.mseed": "mseed",
		"vnd.fdsn.seed": [
			"seed",
			"dataless"
		],
		"vnd.flographit": "gph",
		"vnd.fluxtime.clip": "ftc",
		"vnd.framemaker": [
			"fm",
			"frame",
			"maker",
			"book"
		],
		"vnd.frogans.fnc": "fnc",
		"vnd.frogans.ltf": "ltf",
		"vnd.fsc.weblaunch": "fsc",
		"vnd.fujitsu.oasys": "oas",
		"vnd.fujitsu.oasys2": "oa2",
		"vnd.fujitsu.oasys3": "oa3",
		"vnd.fujitsu.oasysgp": "fg5",
		"vnd.fujitsu.oasysprs": "bh2",
		"vnd.fujixerox.ddd": "ddd",
		"vnd.fujixerox.docuworks": "xdw",
		"vnd.fujixerox.docuworks.binder": "xbd",
		"vnd.fuzzysheet": "fzs",
		"vnd.genomatix.tuxedo": "txd",
		"vnd.geogebra.file": "ggb",
		"vnd.geogebra.tool": "ggt",
		"vnd.geometry-explorer": [
			"gex",
			"gre"
		],
		"vnd.geonext": "gxt",
		"vnd.geoplan": "g2w",
		"vnd.geospace": "g3w",
		"vnd.gmx": "gmx",
		"vnd.grafeq": [
			"gqf",
			"gqs"
		],
		"vnd.groove-account": "gac",
		"vnd.groove-help": "ghf",
		"vnd.groove-identity-message": "gim",
		"vnd.groove-injector": "grv",
		"vnd.groove-tool-message": "gtm",
		"vnd.groove-tool-template": "tpl",
		"vnd.groove-vcard": "vcg",
		"vnd.hal+xml": "hal",
		"vnd.handheld-entertainment+xml": "zmm",
		"vnd.hbci": "hbci",
		"vnd.hhe.lesson-player": "les",
		"vnd.hp-hpgl": "hpgl",
		"vnd.hp-hpid": "hpid",
		"vnd.hp-hps": "hps",
		"vnd.hp-jlyt": "jlt",
		"vnd.hp-pcl": "pcl",
		"vnd.hp-pclxl": "pclxl",
		"vnd.hydrostatix.sof-data": "sfd-hdstx",
		"vnd.ibm.minipay": "mpy",
		"vnd.ibm.modcap": [
			"afp",
			"listafp",
			"list3820"
		],
		"vnd.ibm.rights-management": "irm",
		"vnd.ibm.secure-container": "sc",
		"vnd.iccprofile": [
			"icc",
			"icm"
		],
		"vnd.igloader": "igl",
		"vnd.immervision-ivp": "ivp",
		"vnd.immervision-ivu": "ivu",
		"vnd.insors.igm": "igm",
		"vnd.intercon.formnet": [
			"xpw",
			"xpx"
		],
		"vnd.intergeo": "i2g",
		"vnd.intu.qbo": "qbo",
		"vnd.intu.qfx": "qfx",
		"vnd.ipunplugged.rcprofile": "rcprofile",
		"vnd.irepository.package+xml": "irp",
		"vnd.is-xpr": "xpr",
		"vnd.isac.fcs": "fcs",
		"vnd.jam": "jam",
		"vnd.jcp.javame.midlet-rms": "rms",
		"vnd.jisp": "jisp",
		"vnd.joost.joda-archive": "joda",
		"vnd.kahootz": [
			"ktz",
			"ktr"
		],
		"vnd.kde.karbon": "karbon",
		"vnd.kde.kchart": "chrt",
		"vnd.kde.kformula": "kfo",
		"vnd.kde.kivio": "flw",
		"vnd.kde.kontour": "kon",
		"vnd.kde.kpresenter": [
			"kpr",
			"kpt"
		],
		"vnd.kde.kspread": "ksp",
		"vnd.kde.kword": [
			"kwd",
			"kwt"
		],
		"vnd.kenameaapp": "htke",
		"vnd.kidspiration": "kia",
		"vnd.kinar": [
			"kne",
			"knp"
		],
		"vnd.koan": [
			"skp",
			"skd",
			"skt",
			"skm"
		],
		"vnd.kodak-descriptor": "sse",
		"vnd.las.las+xml": "lasxml",
		"vnd.llamagraphics.life-balance.desktop": "lbd",
		"vnd.llamagraphics.life-balance.exchange+xml": "lbe",
		"vnd.lotus-1-2-3": "123",
		"vnd.lotus-approach": "apr",
		"vnd.lotus-freelance": "pre",
		"vnd.lotus-notes": "nsf",
		"vnd.lotus-organizer": "org",
		"vnd.lotus-screencam": "scm",
		"vnd.lotus-wordpro": "lwp",
		"vnd.macports.portpkg": "portpkg",
		"vnd.mcd": "mcd",
		"vnd.medcalcdata": "mc1",
		"vnd.mediastation.cdkey": "cdkey",
		"vnd.mfer": "mwf",
		"vnd.mfmp": "mfm",
		"vnd.micrografx.flo": "flo",
		"vnd.micrografx.igx": "igx",
		"vnd.mif": "mif",
		"vnd.mobius.daf": "daf",
		"vnd.mobius.dis": "dis",
		"vnd.mobius.mbk": "mbk",
		"vnd.mobius.mqy": "mqy",
		"vnd.mobius.msl": "msl",
		"vnd.mobius.plc": "plc",
		"vnd.mobius.txf": "txf",
		"vnd.mophun.application": "mpn",
		"vnd.mophun.certificate": "mpc",
		"vnd.ms-artgalry": "cil",
		"vnd.ms-cab-compressed": "cab",
		"vnd.ms-excel.addin.macroenabled.12": "xlam",
		"vnd.ms-excel.sheet.binary.macroenabled.12": "xlsb",
		"vnd.ms-excel.sheet.macroenabled.12": "xlsm",
		"vnd.ms-excel.template.macroenabled.12": "xltm",
		"vnd.ms-fontobject": "eot",
		"vnd.ms-htmlhelp": "chm",
		"vnd.ms-ims": "ims",
		"vnd.ms-lrm": "lrm",
		"vnd.ms-officetheme": "thmx",
		"vnd.ms-powerpoint.addin.macroenabled.12": "ppam",
		"vnd.ms-powerpoint.presentation.macroenabled.12": "pptm",
		"vnd.ms-powerpoint.slide.macroenabled.12": "sldm",
		"vnd.ms-powerpoint.slideshow.macroenabled.12": "ppsm",
		"vnd.ms-powerpoint.template.macroenabled.12": "potm",
		"vnd.ms-project": [
			"mpp",
			"mpt"
		],
		"vnd.ms-word.document.macroenabled.12": "docm",
		"vnd.ms-word.template.macroenabled.12": "dotm",
		"vnd.ms-works": [
			"wps",
			"wks",
			"wcm",
			"wdb"
		],
		"vnd.ms-wpl": "wpl",
		"vnd.ms-xpsdocument": "xps",
		"vnd.mseq": "mseq",
		"vnd.musician": "mus",
		"vnd.muvee.style": "msty",
		"vnd.mynfc": "taglet",
		"vnd.neurolanguage.nlu": "nlu",
		"vnd.nitf": [
			"ntf",
			"nitf"
		],
		"vnd.noblenet-directory": "nnd",
		"vnd.noblenet-sealer": "nns",
		"vnd.noblenet-web": "nnw",
		"vnd.nokia.n-gage.data": "ngdat",
		"vnd.nokia.n-gage.symbian.install": "n-gage",
		"vnd.nokia.radio-preset": "rpst",
		"vnd.nokia.radio-presets": "rpss",
		"vnd.novadigm.edm": "edm",
		"vnd.novadigm.edx": "edx",
		"vnd.novadigm.ext": "ext",
		"vnd.oasis.opendocument.chart-template": "otc",
		"vnd.oasis.opendocument.formula-template": "odft",
		"vnd.oasis.opendocument.image-template": "oti",
		"vnd.olpc-sugar": "xo",
		"vnd.oma.dd2+xml": "dd2",
		"vnd.openofficeorg.extension": "oxt",
		"vnd.openxmlformats-officedocument.presentationml.slide": "sldx",
		"vnd.osgeo.mapguide.package": "mgp",
		"vnd.osgi.dp": "dp",
		"vnd.osgi.subsystem": "esa",
		"vnd.palm": [
			"pdb",
			"pqa",
			"oprc"
		],
		"vnd.pawaafile": "paw",
		"vnd.pg.format": "str",
		"vnd.pg.osasli": "ei6",
		"vnd.picsel": "efif",
		"vnd.pmi.widget": "wg",
		"vnd.pocketlearn": "plf",
		"vnd.powerbuilder6": "pbd",
		"vnd.previewsystems.box": "box",
		"vnd.proteus.magazine": "mgz",
		"vnd.publishare-delta-tree": "qps",
		"vnd.pvi.ptid1": "ptid",
		"vnd.quark.quarkxpress": [
			"qxd",
			"qxt",
			"qwd",
			"qwt",
			"qxl",
			"qxb"
		],
		"vnd.realvnc.bed": "bed",
		"vnd.recordare.musicxml": "mxl",
		"vnd.recordare.musicxml+xml": "musicxml",
		"vnd.rig.cryptonote": "cryptonote",
		"vnd.rn-realmedia": "rm",
		"vnd.rn-realmedia-vbr": "rmvb",
		"vnd.route66.link66+xml": "link66",
		"vnd.sailingtracker.track": "st",
		"vnd.seemail": "see",
		"vnd.sema": "sema",
		"vnd.semd": "semd",
		"vnd.semf": "semf",
		"vnd.shana.informed.formdata": "ifm",
		"vnd.shana.informed.formtemplate": "itp",
		"vnd.shana.informed.interchange": "iif",
		"vnd.shana.informed.package": "ipk",
		"vnd.simtech-mindmapper": [
			"twd",
			"twds"
		],
		"vnd.smart.teacher": "teacher",
		"vnd.solent.sdkm+xml": [
			"sdkm",
			"sdkd"
		],
		"vnd.spotfire.dxp": "dxp",
		"vnd.spotfire.sfs": "sfs",
		"vnd.stepmania.package": "smzip",
		"vnd.stepmania.stepchart": "sm",
		"vnd.sus-calendar": [
			"sus",
			"susp"
		],
		"vnd.svd": "svd",
		"vnd.syncml+xml": "xsm",
		"vnd.syncml.dm+wbxml": "bdm",
		"vnd.syncml.dm+xml": "xdm",
		"vnd.tao.intent-module-archive": "tao",
		"vnd.tcpdump.pcap": [
			"pcap",
			"cap",
			"dmp"
		],
		"vnd.tmobile-livetv": "tmo",
		"vnd.trid.tpt": "tpt",
		"vnd.triscape.mxs": "mxs",
		"vnd.trueapp": "tra",
		"vnd.ufdl": [
			"ufd",
			"ufdl"
		],
		"vnd.uiq.theme": "utz",
		"vnd.umajin": "umj",
		"vnd.unity": "unityweb",
		"vnd.uoml+xml": "uoml",
		"vnd.vcx": "vcx",
		"vnd.visionary": "vis",
		"vnd.vsf": "vsf",
		"vnd.webturbo": "wtb",
		"vnd.wolfram.player": "nbp",
		"vnd.wqd": "wqd",
		"vnd.wt.stf": "stf",
		"vnd.xara": "xar",
		"vnd.xfdl": "xfdl",
		"vnd.yamaha.hv-dic": "hvd",
		"vnd.yamaha.hv-script": "hvs",
		"vnd.yamaha.hv-voice": "hvp",
		"vnd.yamaha.openscoreformat": "osf",
		"vnd.yamaha.openscoreformat.osfpvg+xml": "osfpvg",
		"vnd.yamaha.smaf-audio": "saf",
		"vnd.yamaha.smaf-phrase": "spf",
		"vnd.yellowriver-custom-menu": "cmp",
		"vnd.zul": [
			"zir",
			"zirz"
		],
		"vnd.zzazz.deck+xml": "zaz",
		"voicexml+xml": "vxml",
		"widget": "wgt",
		"winhlp": "hlp",
		"wsdl+xml": "wsdl",
		"wspolicy+xml": "wspolicy",
		"x-ace-compressed": "ace",
		"x-authorware-bin": [
			"aab",
			"x32",
			"u32",
			"vox"
		],
		"x-authorware-map": "aam",
		"x-authorware-seg": "aas",
		"x-blorb": [
			"blb",
			"blorb"
		],
		"x-bzip": "bz",
		"x-bzip2": [
			"bz2",
			"boz"
		],
		"x-cfs-compressed": "cfs",
		"x-chat": "chat",
		"x-conference": "nsc",
		"x-dgc-compressed": "dgc",
		"x-dtbncx+xml": "ncx",
		"x-dtbook+xml": "dtb",
		"x-dtbresource+xml": "res",
		"x-eva": "eva",
		"x-font-bdf": "bdf",
		"x-font-ghostscript": "gsf",
		"x-font-linux-psf": "psf",
		"x-font-pcf": "pcf",
		"x-font-snf": "snf",
		"x-font-ttf": [
			"ttf",
			"ttc"
		],
		"x-font-type1": [
			"pfa",
			"pfb",
			"pfm",
			"afm"
		],
		"x-freearc": "arc",
		"x-gca-compressed": "gca",
		"x-glulx": "ulx",
		"x-gramps-xml": "gramps",
		"x-install-instructions": "install",
		"x-lzh-compressed": [
			"lzh",
			"lha"
		],
		"x-mie": "mie",
		"x-mobipocket-ebook": [
			"prc",
			"mobi"
		],
		"x-ms-application": "application",
		"x-ms-shortcut": "lnk",
		"x-ms-xbap": "xbap",
		"x-msbinder": "obd",
		"x-mscardfile": "crd",
		"x-msclip": "clp",
		"x-ms-installer": "msi",
		"x-msmediaview": [
			"mvb",
			"m13",
			"m14"
		],
		"x-msmetafile": [
			"wmf",
			"wmz",
			"emf",
			"emz"
		],
		"x-msmoney": "mny",
		"x-mspublisher": "pub",
		"x-msschedule": "scd",
		"x-msterminal": "trm",
		"x-mswrite": "wri",
		"x-nzb": "nzb",
		"x-pkcs12": [
			"p12",
			"pfx"
		],
		"x-pkcs7-certificates": [
			"p7b",
			"spc"
		],
		"x-research-info-systems": "ris",
		"x-silverlight-app": "xap",
		"x-sql": "sql",
		"x-stuffitx": "sitx",
		"x-subrip": "srt",
		"x-t3vm-image": "t3",
		"x-tex-tfm": "tfm",
		"x-tgif": "obj",
		"x-xliff+xml": "xlf",
		"x-xz": "xz",
		"x-zmachine": [
			"z1",
			"z2",
			"z3",
			"z4",
			"z5",
			"z6",
			"z7",
			"z8"
		],
		"xaml+xml": "xaml",
		"xcap-diff+xml": "xdf",
		"xenc+xml": "xenc",
		"xml-dtd": "dtd",
		"xop+xml": "xop",
		"xproc+xml": "xpl",
		"xslt+xml": "xslt",
		"xv+xml": [
			"mxml",
			"xhvml",
			"xvml",
			"xvm"
		],
		"yang": "yang",
		"yin+xml": "yin",
		"envoy": "evy",
		"fractals": "fif",
		"internet-property-stream": "acx",
		"olescript": "axs",
		"vnd.ms-outlook": "msg",
		"vnd.ms-pkicertstore": "sst",
		"x-compress": "z",
		"x-perfmon": [
			"pma",
			"pmc",
			"pmr",
			"pmw"
		],
		"ynd.ms-pkipko": "pko",
		"gzip": [
			"gz",
			"tgz"
		],
		"smil+xml": [
			"smi",
			"smil"
		],
		"vnd.debian.binary-package": [
			"deb",
			"udeb"
		],
		"vnd.hzn-3d-crossword": "x3d",
		"vnd.sqlite3": [
			"db",
			"sqlite",
			"sqlite3",
			"db-wal",
			"sqlite-wal",
			"db-shm",
			"sqlite-shm"
		],
		"vnd.wap.sic": "sic",
		"vnd.wap.slc": "slc",
		"x-krita": [
			"kra",
			"krz"
		],
		"x-perl": [
			"pm",
			"pl"
		],
		"yaml": [
			"yaml",
			"yml"
		]
	},
	"audio": {
		"amr": "amr",
		"amr-wb": "awb",
		"annodex": "axa",
		"basic": [
			"au",
			"snd"
		],
		"flac": "flac",
		"midi": [
			"mid",
			"midi",
			"kar",
			"rmi"
		],
		"mpeg": [
			"mpga",
			"mpega",
			"mp3",
			"m4a",
			"mp2a",
			"m2a",
			"m3a"
		],
		"mpegurl": "m3u",
		"ogg": [
			"oga",
			"ogg",
			"spx"
		],
		"prs.sid": "sid",
		"x-aiff": "aifc",
		"x-gsm": "gsm",
		"x-ms-wma": "wma",
		"x-ms-wax": "wax",
		"x-pn-realaudio": "ram",
		"x-realaudio": "ra",
		"x-sd2": "sd2",
		"adpcm": "adp",
		"mp4": "mp4a",
		"s3m": "s3m",
		"silk": "sil",
		"vnd.dece.audio": [
			"uva",
			"uvva"
		],
		"vnd.digital-winds": "eol",
		"vnd.dra": "dra",
		"vnd.dts": "dts",
		"vnd.dts.hd": "dtshd",
		"vnd.lucent.voice": "lvp",
		"vnd.ms-playready.media.pya": "pya",
		"vnd.nuera.ecelp4800": "ecelp4800",
		"vnd.nuera.ecelp7470": "ecelp7470",
		"vnd.nuera.ecelp9600": "ecelp9600",
		"vnd.rip": "rip",
		"webm": "weba",
		"x-caf": "caf",
		"x-matroska": "mka",
		"x-pn-realaudio-plugin": "rmp",
		"xm": "xm",
		"aac": "aac",
		"aiff": [
			"aiff",
			"aif",
			"aff"
		],
		"opus": "opus",
		"wav": "wav"
	},
	"chemical": {
		"x-alchemy": "alc",
		"x-cache": [
			"cac",
			"cache"
		],
		"x-cache-csf": "csf",
		"x-cactvs-binary": [
			"cbin",
			"cascii",
			"ctab"
		],
		"x-cdx": "cdx",
		"x-chem3d": "c3d",
		"x-cif": "cif",
		"x-cmdf": "cmdf",
		"x-cml": "cml",
		"x-compass": "cpa",
		"x-crossfire": "bsd",
		"x-csml": [
			"csml",
			"csm"
		],
		"x-ctx": "ctx",
		"x-cxf": [
			"cxf",
			"cef"
		],
		"x-embl-dl-nucleotide": [
			"emb",
			"embl"
		],
		"x-gamess-input": [
			"inp",
			"gam",
			"gamin"
		],
		"x-gaussian-checkpoint": [
			"fch",
			"fchk"
		],
		"x-gaussian-cube": "cub",
		"x-gaussian-input": [
			"gau",
			"gjc",
			"gjf"
		],
		"x-gaussian-log": "gal",
		"x-gcg8-sequence": "gcg",
		"x-genbank": "gen",
		"x-hin": "hin",
		"x-isostar": [
			"istr",
			"ist"
		],
		"x-jcamp-dx": [
			"jdx",
			"dx"
		],
		"x-kinemage": "kin",
		"x-macmolecule": "mcm",
		"x-macromodel-input": "mmod",
		"x-mdl-molfile": "mol",
		"x-mdl-rdfile": "rd",
		"x-mdl-rxnfile": "rxn",
		"x-mdl-sdfile": "sd",
		"x-mdl-tgf": "tgf",
		"x-mmcif": "mcif",
		"x-mol2": "mol2",
		"x-molconn-Z": "b",
		"x-mopac-graph": "gpt",
		"x-mopac-input": [
			"mop",
			"mopcrt",
			"zmt"
		],
		"x-mopac-out": "moo",
		"x-ncbi-asn1": "asn",
		"x-ncbi-asn1-ascii": [
			"prt",
			"ent"
		],
		"x-ncbi-asn1-binary": "val",
		"x-rosdal": "ros",
		"x-swissprot": "sw",
		"x-vamas-iso14976": "vms",
		"x-vmd": "vmd",
		"x-xtel": "xtel",
		"x-xyz": "xyz"
	},
	"font": {
		"otf": "otf",
		"woff": "woff",
		"woff2": "woff2"
	},
	"image": {
		"gif": "gif",
		"ief": "ief",
		"jpeg": [
			"jpeg",
			"jpg",
			"jpe",
			"jfif",
			"jfif-tbnl",
			"jif"
		],
		"pcx": "pcx",
		"png": "png",
		"svg+xml": [
			"svg",
			"svgz"
		],
		"tiff": [
			"tiff",
			"tif"
		],
		"vnd.djvu": [
			"djvu",
			"djv"
		],
		"vnd.wap.wbmp": "wbmp",
		"x-canon-cr2": "cr2",
		"x-canon-crw": "crw",
		"x-cmu-raster": "ras",
		"x-coreldraw": "cdr",
		"x-coreldrawpattern": "pat",
		"x-coreldrawtemplate": "cdt",
		"x-corelphotopaint": "cpt",
		"x-epson-erf": "erf",
		"x-icon": "ico",
		"x-jg": "art",
		"x-jng": "jng",
		"x-nikon-nef": "nef",
		"x-olympus-orf": "orf",
		"x-portable-anymap": "pnm",
		"x-portable-bitmap": "pbm",
		"x-portable-graymap": "pgm",
		"x-portable-pixmap": "ppm",
		"x-rgb": "rgb",
		"x-xbitmap": "xbm",
		"x-xpixmap": "xpm",
		"x-xwindowdump": "xwd",
		"bmp": "bmp",
		"cgm": "cgm",
		"g3fax": "g3",
		"ktx": "ktx",
		"prs.btif": "btif",
		"sgi": "sgi",
		"vnd.dece.graphic": [
			"uvi",
			"uvvi",
			"uvg",
			"uvvg"
		],
		"vnd.dwg": "dwg",
		"vnd.dxf": "dxf",
		"vnd.fastbidsheet": "fbs",
		"vnd.fpx": "fpx",
		"vnd.fst": "fst",
		"vnd.fujixerox.edmics-mmr": "mmr",
		"vnd.fujixerox.edmics-rlc": "rlc",
		"vnd.ms-modi": "mdi",
		"vnd.ms-photo": "wdp",
		"vnd.net-fpx": "npx",
		"vnd.xiff": "xif",
		"webp": "webp",
		"x-3ds": "3ds",
		"x-cmx": "cmx",
		"x-freehand": [
			"fh",
			"fhc",
			"fh4",
			"fh5",
			"fh7"
		],
		"x-pict": [
			"pic",
			"pct"
		],
		"x-tga": "tga",
		"cis-cod": "cod",
		"avif": [
			"avif",
			"avifs"
		],
		"heic": [
			"heif",
			"heic"
		],
		"pjpeg": [
			"pjpg"
		],
		"vnd.adobe.photoshop": "psd",
		"x-adobe-dng": "dng",
		"x-fuji-raf": "raf",
		"x-icns": "icns",
		"x-kodak-dcr": "dcr",
		"x-kodak-k25": "k25",
		"x-kodak-kdc": "kdc",
		"x-minolta-mrw": "mrw",
		"x-panasonic-raw": [
			"raw",
			"rw2",
			"rwl"
		],
		"x-pentax-pef": [
			"pef",
			"ptx"
		],
		"x-sigma-x3f": "x3f",
		"x-sony-arw": "arw",
		"x-sony-sr2": "sr2",
		"x-sony-srf": "srf"
	},
	"message": {
		"rfc822": [
			"eml",
			"mime",
			"mht",
			"mhtml",
			"nws"
		]
	},
	"model": {
		"iges": [
			"igs",
			"iges"
		],
		"mesh": [
			"msh",
			"mesh",
			"silo"
		],
		"vrml": [
			"wrl",
			"vrml"
		],
		"x3d+vrml": [
			"x3dv",
			"x3dvz"
		],
		"x3d+xml": "x3dz",
		"x3d+binary": [
			"x3db",
			"x3dbz"
		],
		"vnd.collada+xml": "dae",
		"vnd.dwf": "dwf",
		"vnd.gdl": "gdl",
		"vnd.gtw": "gtw",
		"vnd.mts": "mts",
		"vnd.usdz+zip": "usdz",
		"vnd.vtu": "vtu"
	},
	"text": {
		"cache-manifest": [
			"manifest",
			"appcache"
		],
		"calendar": [
			"ics",
			"icz",
			"ifb"
		],
		"css": "css",
		"csv": "csv",
		"h323": "323",
		"html": [
			"html",
			"htm",
			"shtml",
			"stm"
		],
		"iuls": "uls",
		"plain": [
			"txt",
			"text",
			"brf",
			"conf",
			"def",
			"list",
			"log",
			"in",
			"bas",
			"diff",
			"ksh"
		],
		"richtext": "rtx",
		"scriptlet": [
			"sct",
			"wsc"
		],
		"texmacs": "tm",
		"tab-separated-values": "tsv",
		"vnd.sun.j2me.app-descriptor": "jad",
		"vnd.wap.wml": "wml",
		"vnd.wap.wmlscript": "wmls",
		"x-bibtex": "bib",
		"x-boo": "boo",
		"x-c++hdr": [
			"h++",
			"hpp",
			"hxx",
			"hh"
		],
		"x-c++src": [
			"c++",
			"cpp",
			"cxx",
			"cc"
		],
		"x-component": "htc",
		"x-dsrc": "d",
		"x-diff": "patch",
		"x-haskell": "hs",
		"x-java": "java",
		"x-literate-haskell": "lhs",
		"x-moc": "moc",
		"x-pascal": [
			"p",
			"pas",
			"pp",
			"inc"
		],
		"x-pcs-gcd": "gcd",
		"x-python": "py",
		"x-scala": "scala",
		"x-setext": "etx",
		"x-tcl": [
			"tcl",
			"tk"
		],
		"x-tex": [
			"tex",
			"ltx",
			"sty",
			"cls"
		],
		"x-vcalendar": "vcs",
		"x-vcard": "vcf",
		"n3": "n3",
		"prs.lines.tag": "dsc",
		"sgml": [
			"sgml",
			"sgm"
		],
		"troff": [
			"t",
			"tr",
			"roff",
			"man",
			"me",
			"ms"
		],
		"turtle": "ttl",
		"uri-list": [
			"uri",
			"uris",
			"urls"
		],
		"vcard": "vcard",
		"vnd.curl": "curl",
		"vnd.curl.dcurl": "dcurl",
		"vnd.curl.scurl": "scurl",
		"vnd.curl.mcurl": "mcurl",
		"vnd.dvb.subtitle": "sub",
		"vnd.fly": "fly",
		"vnd.fmi.flexstor": "flx",
		"vnd.graphviz": "gv",
		"vnd.in3d.3dml": "3dml",
		"vnd.in3d.spot": "spot",
		"x-asm": [
			"s",
			"asm"
		],
		"x-c": [
			"c",
			"h",
			"dic"
		],
		"x-fortran": [
			"f",
			"for",
			"f77",
			"f90"
		],
		"x-opml": "opml",
		"x-nfo": "nfo",
		"x-sfv": "sfv",
		"x-uuencode": "uu",
		"webviewhtml": "htt",
		"javascript": "js",
		"json": "json",
		"markdown": [
			"md",
			"markdown",
			"mdown",
			"markdn"
		],
		"vnd.wap.si": "si",
		"vnd.wap.sl": "sl"
	},
	"video": {
		"3gpp": "3gp",
		"annodex": "axv",
		"dl": "dl",
		"dv": [
			"dif",
			"dv"
		],
		"fli": "fli",
		"gl": "gl",
		"mpeg": [
			"mpeg",
			"mpg",
			"mpe",
			"m1v",
			"m2v",
			"mp2",
			"mpa",
			"mpv2"
		],
		"mp4": [
			"mp4",
			"mp4v",
			"mpg4"
		],
		"quicktime": [
			"qt",
			"mov"
		],
		"ogg": "ogv",
		"vnd.mpegurl": [
			"mxu",
			"m4u"
		],
		"x-flv": "flv",
		"x-la-asf": [
			"lsf",
			"lsx"
		],
		"x-mng": "mng",
		"x-ms-asf": [
			"asf",
			"asx",
			"asr"
		],
		"x-ms-wm": "wm",
		"x-ms-wmv": "wmv",
		"x-ms-wmx": "wmx",
		"x-ms-wvx": "wvx",
		"x-msvideo": "avi",
		"x-sgi-movie": "movie",
		"x-matroska": [
			"mpv",
			"mkv",
			"mk3d",
			"mks"
		],
		"3gpp2": "3g2",
		"h261": "h261",
		"h263": "h263",
		"h264": "h264",
		"jpeg": "jpgv",
		"jpm": [
			"jpm",
			"jpgm"
		],
		"mj2": [
			"mj2",
			"mjp2"
		],
		"vnd.dece.hd": [
			"uvh",
			"uvvh"
		],
		"vnd.dece.mobile": [
			"uvm",
			"uvvm"
		],
		"vnd.dece.pd": [
			"uvp",
			"uvvp"
		],
		"vnd.dece.sd": [
			"uvs",
			"uvvs"
		],
		"vnd.dece.video": [
			"uvv",
			"uvvv"
		],
		"vnd.dvb.file": "dvb",
		"vnd.fvt": "fvt",
		"vnd.ms-playready.media.pyv": "pyv",
		"vnd.uvvu.mp4": [
			"uvu",
			"uvvu"
		],
		"vnd.vivo": "viv",
		"webm": "webm",
		"x-f4v": "f4v",
		"x-m4v": "m4v",
		"x-ms-vob": "vob",
		"x-smv": "smv",
		"mp2t": "ts"
	},
	"x-conference": {
		"x-cooltalk": "ice"
	},
	"x-world": {
		"x-vrml": [
			"vrm",
			"flr",
			"wrz",
			"xaf",
			"xof"
		]
	}
};

let mimeTypes;

function getMimeType(filename) {
	return filename && getMimeTypes()[filename.split(".").pop().toLowerCase()] || getMimeType$1();
}

function getMimeTypes() {
	if (!mimeTypes) {
		mimeTypes = {};
		for (const type of Object.keys(table)) {
			for (const subtype of Object.keys(table[type])) {
				const value = table[type][subtype];
				if (typeof value == "string") {
					mimeTypes[value] = type + "/" + subtype;
				} else {
					for (let indexMimeType = 0; indexMimeType < value.length; indexMimeType++) {
						mimeTypes[value[indexMimeType]] = type + "/" + subtype;
					}
				}
			}
		}
	}
	return mimeTypes;
}

/*
 Copyright (c) 2025 Gildas Lormeau. All rights reserved.

 Redistribution and use in source and binary forms, with or without
 modification, are permitted provided that the following conditions are met:

 1. Redistributions of source code must retain the above copyright notice,
 this list of conditions and the following disclaimer.

 2. Redistributions in binary form must reproduce the above copyright
 notice, this list of conditions and the following disclaimer in
 the documentation and/or other materials provided with the distribution.

 3. The names of the authors may not be used to endorse or promote products
 derived from this software without specific prior written permission.

 THIS SOFTWARE IS PROVIDED ''AS IS'' AND ANY EXPRESSED OR IMPLIED WARRANTIES,
 INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND
 FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL JCRAFT,
 INC. OR ANY CONTRIBUTORS TO THIS SOFTWARE BE LIABLE FOR ANY DIRECT, INDIRECT,
 INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA,
 OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
 LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
 EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */


f(configure);

exports.BlobReader = BlobReader;
exports.BlobWriter = BlobWriter;
exports.Data64URIReader = Data64URIReader;
exports.Data64URIWriter = Data64URIWriter;
exports.ERR_AMBIGUOUS_ARCHIVE = ERR_AMBIGUOUS_ARCHIVE;
exports.ERR_BAD_FORMAT = ERR_BAD_FORMAT;
exports.ERR_CENTRAL_DIRECTORY_NOT_FOUND = ERR_CENTRAL_DIRECTORY_NOT_FOUND;
exports.ERR_DUPLICATED_NAME = ERR_DUPLICATED_NAME;
exports.ERR_ENCRYPTED = ERR_ENCRYPTED;
exports.ERR_EOCDR_LOCATOR_ZIP64_NOT_FOUND = ERR_EOCDR_LOCATOR_ZIP64_NOT_FOUND;
exports.ERR_EOCDR_NOT_FOUND = ERR_EOCDR_NOT_FOUND;
exports.ERR_EXTRAFIELD_ZIP64_NOT_FOUND = ERR_EXTRAFIELD_ZIP64_NOT_FOUND;
exports.ERR_HTTP_RANGE = ERR_HTTP_RANGE;
exports.ERR_INVALID_COMMENT = ERR_INVALID_COMMENT;
exports.ERR_INVALID_COMPRESSED_DATA = ERR_INVALID_COMPRESSED_DATA;
exports.ERR_INVALID_ENCRYPTION_STRENGTH = ERR_INVALID_ENCRYPTION_STRENGTH;
exports.ERR_INVALID_ENTRY_COMMENT = ERR_INVALID_ENTRY_COMMENT;
exports.ERR_INVALID_ENTRY_NAME = ERR_INVALID_ENTRY_NAME;
exports.ERR_INVALID_EXTRAFIELD_DATA = ERR_INVALID_EXTRAFIELD_DATA;
exports.ERR_INVALID_EXTRAFIELD_TYPE = ERR_INVALID_EXTRAFIELD_TYPE;
exports.ERR_INVALID_PASSWORD = ERR_INVALID_PASSWORD;
exports.ERR_INVALID_SIGNATURE = ERR_INVALID_SIGNATURE;
exports.ERR_INVALID_UNCOMPRESSED_SIZE = ERR_INVALID_UNCOMPRESSED_SIZE;
exports.ERR_INVALID_VERSION = ERR_INVALID_VERSION;
exports.ERR_ITERATOR_COMPLETED_TOO_SOON = ERR_ITERATOR_COMPLETED_TOO_SOON;
exports.ERR_LOCAL_FILE_HEADER_NOT_FOUND = ERR_LOCAL_FILE_HEADER_NOT_FOUND;
exports.ERR_OVERLAPPING_ENTRY = ERR_OVERLAPPING_ENTRY;
exports.ERR_SPLIT_ZIP_FILE = ERR_SPLIT_ZIP_FILE;
exports.ERR_UNDEFINED_READER = ERR_UNDEFINED_READER;
exports.ERR_UNDEFINED_UNCOMPRESSED_SIZE = ERR_UNDEFINED_UNCOMPRESSED_SIZE;
exports.ERR_UNSUPPORTED_COMPRESSION = ERR_UNSUPPORTED_COMPRESSION$1;
exports.ERR_UNSUPPORTED_ENCRYPTION = ERR_UNSUPPORTED_ENCRYPTION;
exports.ERR_UNSUPPORTED_FORMAT = ERR_UNSUPPORTED_FORMAT;
exports.ERR_WRITER_NOT_INITIALIZED = ERR_WRITER_NOT_INITIALIZED;
exports.ERR_ZIP_NOT_EMPTY = ERR_ZIP_NOT_EMPTY;
exports.HttpRangeReader = HttpRangeReader;
exports.HttpReader = HttpReader;
exports.Reader = Reader;
exports.SplitDataReader = SplitDataReader;
exports.SplitDataWriter = SplitDataWriter;
exports.TextReader = TextReader;
exports.TextWriter = TextWriter;
exports.Uint8ArrayReader = Uint8ArrayReader;
exports.Uint8ArrayWriter = Uint8ArrayWriter;
exports.Writer = Writer;
exports.ZipReader = ZipReader;
exports.ZipReaderStream = ZipReaderStream;
exports.ZipWriter = ZipWriter;
exports.ZipWriterStream = ZipWriterStream;
exports.configure = configure;
exports.createOPFSTempStream = createOPFSTempStream;
exports.fs = fs;
exports.getMimeType = getMimeType;
exports.terminateWorkers = terminateWorkers;
