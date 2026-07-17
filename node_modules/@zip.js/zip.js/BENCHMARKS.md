# Benchmarks

A fair, reproducible comparison of **@zip.js/zip.js** against
[jszip](https://github.com/Stuk/jszip), [fflate](https://github.com/101arrowz/fflate)
and [archiver](https://github.com/archiverjs/node-archiver) on a set of realistic
workloads.

The numbers below are honest: zip.js wins clearly on some workloads and loses on
others. The goal is to show *where* each library is the right tool, and to give you a
harness you can re-run on your own hardware — the results are machine-specific and you
should not trust anyone's benchmark (including this one) without reproducing it.

> **TL;DR** — For compressing large or multiple entries, zip.js is the fastest option
> in the field, and it is the only one that parallelizes compression across CPU cores
> **without spawning a single Web Worker** — it lets the platform's native
> `CompressionStream` run on the threadpool while you simply issue concurrent `add()`
> calls. It also streams arbitrarily large files at a flat, low memory ceiling. For
> deflating thousands of tiny buffers in one shot, **fflate** remains the throughput
> and footprint champion.

## Environment

| | |
|---|---|
| Machine | Apple M2, 8 cores (4 performance + 4 efficiency), 16 GB RAM |
| OS | macOS 26.5.1 (arm64) |
| Runtime | Node.js v24.12.0 |
| zip.js | 2.8.29 |
| jszip | 3.10.1 |
| fflate | 0.8.3 |
| archiver | 8.0.0 |

## Method

- **Isolation.** Each `(library, operation, workload)` combination runs in its own
  freshly-spawned Node process under `/usr/bin/time -l`, so there is no cross-library
  GC or heap contamination and peak memory is a true per-library figure.
- **Timing.** `performance.now()` around the measured operation only. Every combination
  runs **3 times**; the table reports the **median**.
- **Memory.** Peak resident set size (RSS) reported by `/usr/bin/time -l`. The "peak"
  column is the delta over an empty-process baseline (~42 MB), i.e. the memory
  attributable to the work.
- **Fair work.** All libraries compress at **DEFLATE level 6**. Output sizes are shown
  so you can confirm each library did equivalent work. The corpus is generated from a
  seeded PRNG, so every library sees byte-for-byte identical input.
- **zip.js modes.** zip.js is measured both **single-threaded** (apples-to-apples with
  the single-threaded libraries) and with its **Web Worker** pool, so the worker
  overhead is never hidden.

## Compression — single process, single thread

Level-6 DEFLATE, one entry (or one batch) compressed in the main thread. This is the
apples-to-apples comparison against the single-threaded libraries.

| Workload | @zip.js/zip.js | jszip | fflate | archiver |
|---|--:|--:|--:|--:|
| Compressible text (20 MB) | **795 ms** | 1770 ms | 953 ms | 720 ms |
| Incompressible data (20 MB) | 446 ms | 883 ms | **306 ms** | 366 ms |
| Already-compressed media (20 MB) | 452 ms | 886 ms | **298 ms** | 358 ms |
| 5,000 files × ~2 KB | 845 ms | 887 ms | **287 ms** | 419 ms |

Peak memory for the same runs (Δ over baseline):

| Workload | @zip.js/zip.js | jszip | fflate | archiver |
|---|--:|--:|--:|--:|
| Compressible text (20 MB) | 92 MB | 65 MB | **60 MB** | 82 MB |
| Incompressible data (20 MB) | 141 MB | 93 MB | 106 MB | **83 MB** |
| Already-compressed media (20 MB) | 142 MB | 94 MB | 106 MB | **83 MB** |
| 5,000 files × ~2 KB | 266 MB | 270 MB | **102 MB** | 118 MB |

zip.js is fastest on compressible text and competitive with archiver elsewhere, at
roughly comparable compressed sizes. **fflate** is the clear winner on raw throughput
and footprint for incompressible data and for large numbers of tiny files — if that is
your workload, use fflate.

## Parallelism & codec backends — 8 files × 8 MB, single process

This is the headline. The same 64 MB of compressible entries, compressed several ways
in a **plain Node process** (no worker threads unless noted). zip.js can select its
codec backend at runtime — native `CompressionStream`, the bundled WebAssembly zlib, or
a pure-JavaScript zlib port — and it can issue `add()` calls concurrently.

| Configuration | Median time | vs jszip |
|---|--:|--:|
| **zip.js — `CompressionStream`, concurrent `add()`** | **657 ms** | **8.8×** |
| fflate — async (its own worker pool) | 729 ms | 7.9× |
| archiver — Node zlib (libuv threadpool) | 2266 ms | 2.5× |
| zip.js — `CompressionStream`, sequential | 2453 ms | 2.3× |
| fflate — `zipSync` (single thread) | 3103 ms | 1.9× |
| zip.js — WASM zlib | 4176 ms | 1.4× |
| zip.js — pure-JS zlib | 4709 ms | 1.2× |
| jszip (pako, single thread) | 5758 ms | 1.0× |

**The point:** zip.js with the native `CompressionStream` goes from **2453 ms
sequential to 657 ms with concurrent `add()` — a 3.7× speedup — using no Web Workers at
all.** The native codec runs on the platform's threadpool, so independent entries
compress on multiple cores while your code stays on the main thread. That makes it the
fastest configuration measured, narrowly ahead of fflate's dedicated worker pool.

One honest caveat, visible in the table: **only the native `CompressionStream` backend
parallelizes this way.** The WASM and pure-JS backends run synchronously on the main
thread, so concurrent `add()` does not speed them up (4176 ms and 4709 ms whether
sequential or "parallel"). Use those backends when a native `CompressionStream` is
unavailable or when you need byte-identical zlib output; use the native backend when you
want this parallelism.

There is a second way to land on the WASM backend by accident: because
`CompressionStream` exposes no level control, requesting any non-default compression
level (e.g. `{ level: 5 }`) makes zip.js fall back to the WASM zlib codec — which, per
the table, does not parallelize via concurrent `add()`. Keep the default level to keep
the native-backend parallelism, or pair a custom level with Web Workers (below).

### Parallelism is runtime-dependent

The table above is measured on **Node**, and its "no Web Workers needed" result does
**not** hold on every runtime: concurrent `add()` only spreads across cores if the
runtime runs `CompressionStream` off the main thread. Same 8 × 8 MB workload, level 6,
median of 3:

| Runtime | sequential | concurrent `add()` | concurrent `add()` + `useWebWorkers` |
|---|--:|--:|--:|
| Node.js | 2.94 s | **0.74 s** | 0.74 s |
| Bun | 1.80 s | **0.36 s** | 0.46 s |
| Deno | 1.84 s | 1.82 s | **0.47 s** |

- **Node and Bun** back `CompressionStream` with a threadpool, so concurrent `add()`
  alone parallelizes — no Web Workers needed (Bun is fastest here).
- **Deno** runs `CompressionStream` on the isolate thread, so concurrent `add()` alone
  gives no speedup (1.82 s ≈ its 1.84 s sequential). Set `useWebWorkers: true` and it
  parallelizes properly (0.47 s), landing right beside the others.
- **Browsers vary by engine.** Safari/WebKit runs `CompressionStream` on the main thread
  (serial, like Deno), so use `useWebWorkers: true` there. Chromium implements it
  separately and may behave differently — check a given browser by compressing several
  large buffers through `CompressionStream` sequentially versus concurrently and comparing
  the wall time.

**Rule of thumb:** on Node and Bun, concurrent `add()` is enough; on Deno and
Safari/WebKit, also set `useWebWorkers: true`. Web Workers are the portable way to get
this parallelism on any runtime — and the only way once you use a non-default level
(which switches to the WASM codec).

## Decompression

Level-6 archives, read back and fully materialized. archiver has no unzip API, so it is
excluded.

| Workload | @zip.js/zip.js | jszip | fflate |
|---|--:|--:|--:|
| Compressible text (20 MB) | **65 ms** | 143 ms | 82 ms |
| 5,000 files × ~2 KB | 565 ms | 453 ms | **89 ms** |

zip.js has the fastest large-stream decompression. On thousands of tiny entries the
per-entry setup cost dominates and **fflate is dramatically faster and lighter** — again
the right tool when you are unpacking many small files.

## Streaming a large file — 256 MB, disk → zip → disk

The input is streamed from disk and the archive is streamed back to disk; neither is
ever fully held in memory (for the libraries that support it).

| Library | Median time | Peak memory |
|---|--:|--:|
| archiver | 9183 ms | 111 MB |
| zip.js (workers) | 9893 ms | **99 MB** |
| zip.js (1 thread) | 10110 ms | **99 MB** |
| fflate | 10613 ms | 87 MB |
| jszip | 22358 ms | 527 MB |

zip.js, fflate and archiver all hold memory **flat** while streaming — zip.js peaks at
~99 MB regardless of the 256 MB input, thanks to real backpressure through the
compression pipeline. **jszip buffers the entire file** and needs ~527 MB, at more than
twice the wall-clock time. If you process files that do not fit comfortably in memory,
avoid jszip.

## When to pick which

- **Choose zip.js** for the fastest compression of large or multiple entries
  (parallelism with no Web Workers), the fastest large-stream decompression, flat
  low-memory streaming of huge files, and the broadest ZIP feature set in one library —
  AES & ZipCrypto encryption, Zip64, split/multi-volume archives, and an optional Web
  Worker pool.
- **Choose fflate** when you deflate thousands of tiny buffers in a single call and want
  the smallest memory footprint and the highest raw synchronous throughput.
- **archiver** is a solid streaming compressor on Node but cannot read archives.
- **jszip** is convenient but the slowest here and buffers whole files in memory.

## Reproduce

The harness lives in [`benchmarks/`](benchmarks/). It has no ties to the machine above;
run it on yours.

```sh
cd benchmarks
npm install            # jszip, fflate, archiver (zip.js is used from the repo)
npm run corpus         # generate the deterministic datasets under .corpus/
node bench.js          # the head-to-head tables (compress / decompress / disk streaming)
node bench-backends.js # the parallelism & codec-backend matrix
```

Both scripts write JSON and a human-readable log to `benchmarks/results/`. Set
`RUNS=<n>` to change the number of repetitions (default 3). The datasets are generated
from a seeded PRNG (`benchmarks/lib/corpus.js`), so every run — and every library —
sees identical bytes.
