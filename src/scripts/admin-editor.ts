// Skrip bersama untuk editor contenteditable admin + upload gambar.
// Dipakai bersama <AdminEditorToolbar /> (tombol [data-cmd]).

export function initEditor(editor: HTMLElement, hidden: HTMLInputElement) {
  // execCommand deprecated tapi masih didukung semua browser; tanpa library.
  document.execCommand('defaultParagraphSeparator', false, 'p');
  if (!editor.innerHTML.trim()) editor.innerHTML = '<p><br></p>';

  const sync = () => { hidden.value = editor.innerHTML; };
  editor.addEventListener('input', sync);

  document.querySelectorAll<HTMLElement>('[data-cmd]').forEach(btn => {
    // mousedown default akan mencuri seleksi teks dari editor — cegah.
    btn.addEventListener('mousedown', e => e.preventDefault());
    btn.addEventListener('click', async () => {
      const cmd = btn.dataset.cmd ?? '';
      editor.focus();
      if (cmd === 'image') {
        await insertInlineImage(editor);
      } else if (cmd.startsWith('formatBlock-')) {
        const tag = cmd.split('-')[1];
        const current = document.queryCommandValue('formatBlock').toLowerCase();
        // Nilai harus pakai kurung sudut agar bekerja juga di Firefox.
        document.execCommand('formatBlock', false, current === tag ? '<p>' : `<${tag}>`);
      } else {
        document.execCommand(cmd, false);
      }
      sync();
    });
  });
}

async function encodeWebp(file: File, maxPx: number): Promise<Blob> {
  const bmp = await createImageBitmap(file);
  const scale = Math.min(1, maxPx / Math.max(bmp.width, bmp.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(bmp.width * scale));
  canvas.height = Math.max(1, Math.round(bmp.height * scale));
  canvas.getContext('2d')!.drawImage(bmp, 0, 0, canvas.width, canvas.height);
  return new Promise((resolve, reject) =>
    canvas.toBlob(b => (b ? resolve(b) : reject(new Error('encode gagal'))), 'image/webp', 0.8)
  );
}

export interface Uploaded { id: number; url: string; thumbUrl: string }

export async function uploadImage(
  file: File,
  alt: string,
  extra: Record<string, string> = {}
): Promise<Uploaded> {
  const [display, thumb] = await Promise.all([encodeWebp(file, 1600), encodeWebp(file, 400)]);
  const fd = new FormData();
  fd.set('display', display, 'display.webp');
  fd.set('thumb', thumb, 'thumb.webp');
  fd.set('alt', alt);
  for (const [k, v] of Object.entries(extra)) fd.set(k, v);
  const res = await fetch('/api/admin/media', { method: 'POST', body: fd });
  if (!res.ok) throw new Error(`upload gagal (${res.status})`);
  return res.json();
}

function pickFiles(multiple: boolean): Promise<File[]> {
  return new Promise(resolve => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.multiple = multiple;
    input.onchange = () => resolve([...(input.files ?? [])]);
    input.click();
  });
}

async function insertInlineImage(editor: HTMLElement) {
  const sel = window.getSelection();
  const range = sel && sel.rangeCount ? sel.getRangeAt(0).cloneRange() : null;
  const [file] = await pickFiles(false);
  if (!file) return;
  const alt = prompt('Teks alternatif gambar (deskripsi singkat):') ?? '';
  try {
    const { url } = await uploadImage(file, alt);
    editor.focus();
    if (range && sel) { sel.removeAllRanges(); sel.addRange(range); }
    document.execCommand('insertImage', false, url);
    editor.querySelector(`img[src="${url}"]`)?.setAttribute('alt', alt);
  } catch {
    alert('Upload gambar gagal. Periksa koneksi lalu coba lagi.');
  }
}
