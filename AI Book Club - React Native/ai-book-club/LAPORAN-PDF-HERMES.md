# Laporan Perbaikan Ekstraksi PDF di React Native (Hermes)

## Ringkasan

Import PDF berhasil disimpan, tetapi ekstraksi teks PDF.js gagal dengan error:

```
[PDF_EXTRACT] Stack: SyntaxError: 189139:28:Invalid expression encountered
```

Penyebab: pdf.js fallback fake-worker loader menggunakan `await import(...)`, yang **tidak didukung Hermes** (React Native). Fungsi loader di-compile lazily saat `getDocument` dipanggil, sehingga Hermes menolak ekspresi `import(...)`.

## Penyebab

- `src/services/pdf.ts` memakai `getDocument({ data })` (pdf.js v6).
- pdf.js v6 `PDFWorker._setupFakeWorkerGlobal` memiliki fungsi `loader()` dengan baris:
  ```js
  var worker = await import(/*webpackIgnore: true*/ this.workerSrc);
  ```
- Karena `globalThis.pdfjsWorker` ada, pdf.js memakai jalur fake-worker, tetapi getter `_setupFakeWorkerGlobal` tetap memanggil `loader()` (lazy compile), sehingga Hermes gagal compile fungsi tersebut.
- Kolom 28 dari posisi error persis menunjuk token `import(` pada bundel Metro.

## Solusi

Bypass loader fake-worker dengan menjalankan pdf.js di main thread lewat **loopback port**:

1. Import `PDFWorker` dan `WorkerMessageHandler`.
2. Buat kelas `LoopbackPort` (implementasi `postMessage`/`addEventListener`/`removeEventListener`) dengan `structuredClone`.
3. `WorkerMessageHandler.initializeFromPort(port)` menginisialisasi sisi worker.
4. `new PDFWorker({ port })` menginisialisasi sisi main tanpa menyentuh loader dinamis.
5. `getDocument({ data, worker })` dipakai untuk ekstraksi.
6. Cleanup `loadingTask.destroy()` dan `worker.destroy()` di `finally`.

## File yang Diubah

- `src/services/pdf.ts`
- `src/services/__tests__/pdf.test.ts` (mock `PDFWorker` dan `initializeFromPort`)

## Validasi

- `npx tsc --noEmit` → tanpa error
- `npx jest` → 12/12 pass
- `npx expo lint` → OK

## Catatan

- Loopback port bergantung pada `structuredClone` yang tersedia di Expo (winter runtime).
- Jika `WorkerMessageHandler.initializeFromPort` tidak tersedia (versi pdf.js berbeda), ekstraksi fallback ke cover-only.
- Tidak ada dependensi baru.