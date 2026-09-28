const charWidths = {
    'a': 0.6, 'b': 0.6, 'c': 0.6, 'd': 0.6, 'e': 0.6, 'f': 0.4, 'g': 0.6, 'h': 0.6, 'i': 0.3, 'j': 0.3, 'k': 0.6, 'l': 0.3, 'm': 0.9, 'n': 0.6, 'o': 0.6, 'p': 0.6, 'q': 0.6, 'r': 0.4, 's': 0.6, 't': 0.4, 'u': 0.6, 'v': 0.6, 'w': 0.9, 'x': 0.6, 'y': 0.6, 'z': 0.6,
    'A': 0.7, 'B': 0.7, 'C': 0.7, 'D': 0.7, 'E': 0.7, 'F': 0.7, 'G': 0.7, 'H': 0.7, 'I': 0.4, 'J': 0.4, 'K': 0.7, 'L': 0.7, 'M': 0.9, 'N': 0.7, 'O': 0.7, 'P': 0.7, 'Q': 0.7, 'R': 0.7, 'S': 0.7, 'T': 0.7, 'U': 0.7, 'V': 0.7, 'W': 0.9, 'X': 0.7, 'Y': 0.7, 'Z': 0.7,
    ' ': 0.3, '.': 0.3, ',': 0.3, '!': 0.3, '?': 0.3, '-': 0.3, '_': 0.3, ':': 0.3, ';': 0.3, '(': 0.3, ')': 0.3, '[': 0.3, ']': 0.3, '{': 0.3, '}': 0.3, '/': 0.3, '\\': 0.3, '|': 0.3, '@': 0.9, '#': 0.9, '$': 0.9, '%': 0.9, '^': 0.9, '&': 0.9, '*': 0.9, '+': 0.9, '=': 0.9,
    '0': 0.6, '1': 0.6, '2': 0.6, '3': 0.6, '4': 0.6, '5': 0.6, '6': 0.6, '7': 0.6, '8': 0.6, '9': 0.6,
    'q': 0.6, 'Q': 0.7, 'S': 0.7, 'X': 0.7, 'Z': 0.7, '\x00': 0.3
};

const validCharSet = new Set(['9', 'l', 'd', 'D', 'J', 'c', '6', 'V', '\x00', '-', '"', 'H', 't', 'r', '(', 'N', 'u', 'y', 'I', ';', '!', 'F', 'j', ')', '#', 'B', 'O', '4', 'M', 'W', 'f', '?', '8', 'g', ',', '1', 'w', "'", 'A', 'm', 'K', 'C', 'o', ' ', ':', 'n', 'U', 'h', 's', 'q', '5', 'x', 'k', 'S', '0', 'Y', 'p', 'e', 'P', 'a', 'R', 'b', '2', '3', 'v', 'E', 'i', 'G', 'T', '7', '.', 'z', 'L']);
const FONT_WIDTH = 14.4;

let pages = [];
let currentPageIdx = 0;
let exportDirectoryHandle = null;

function approximateWordLength(word) {
    let total = 0;
    if (!word) return 0;
    for (let i = 0; i < word.length; i++) {
        const widthMult = charWidths[word[i]] !== undefined ? charWidths[word[i]] : 1.0;
        total += widthMult * FONT_WIDTH;
    }
    return total;
}

function replaceInvalidChars(word) {
    let newWord = "";
    for (let i = 0; i < word.length; i++) {
        const char = word[i];
        if (!validCharSet.has(char)) {
            if (validCharSet.has(char.toLowerCase())) {
                newWord += char.toLowerCase();
            } else if (validCharSet.has(char.toUpperCase())) {
                newWord += char.toUpperCase();
            }
        } else {
            newWord += char;
        }
    }
    return newWord;
}

function processText() {
    const rawText = document.getElementById("inputText").value;
    const boxWidth = parseInt(document.getElementById("cfgBoxWidth").value) || 503;
    const numLines = parseInt(document.getElementById("cfgNumLines").value) || 32;
    const maxCharPerLine = parseInt(document.getElementById("cfgMaxChars").value) || 72;
    const allLines = [];
    const rawParagraphs = rawText.split('\n');

    for (let pIdx = 0; pIdx < rawParagraphs.length; pIdx++) {
        const paragraph = rawParagraphs[pIdx].trimEnd();
        if (paragraph === "") {
            allLines.push("");
            continue;
        }

        const words = paragraph.split(/\s+/).filter(word => word.length > 0);
        let currentLine = "";

        for (let i = 0; i < words.length; i++) {
            const validWord = replaceInvalidChars(words[i]);
            if (!validWord) continue;

            const wordLength = approximateWordLength(validWord);
            const currentLineLength = approximateWordLength(currentLine);
            if (currentLineLength + wordLength <= boxWidth && currentLine.length + validWord.length + 1 <= maxCharPerLine) {
                currentLine = currentLine ? `${currentLine} ${validWord}` : validWord;
            } else {
                if (currentLine) allLines.push(currentLine);
                currentLine = validWord;
            }
        }

        if (currentLine) allLines.push(currentLine);
    }

    pages = [];
    for (let i = 0; i < allLines.length; i += numLines) {
        pages.push(allLines.slice(i, i + numLines));
    }

    currentPageIdx = 0;
    updatePreview();
}

function updatePreview() {
    const btnPrev = document.getElementById("btnPrev");
    const btnNext = document.getElementById("btnNext");
    const pageIndicator = document.getElementById("pageIndicator");
    const outputText = document.getElementById("outputText");

    if (pages.length === 0) {
        outputText.value = "";
        pageIndicator.textContent = "Page 0 of 0";
        btnPrev.disabled = true;
        btnNext.disabled = true;
        return;
    }

    pageIndicator.textContent = `Page ${currentPageIdx + 1} of ${pages.length}`;
    outputText.value = pages[currentPageIdx].join('\n');
    btnPrev.disabled = currentPageIdx === 0;
    btnNext.disabled = currentPageIdx === pages.length - 1;
}

function prevPage() {
    if (currentPageIdx > 0) {
        currentPageIdx--;
        updatePreview();
    }
}

function nextPage() {
    if (currentPageIdx < pages.length - 1) {
        currentPageIdx++;
        updatePreview();
    }
}

function getDownloadBaseName() {
    const input = document.getElementById("downloadFileName");
    const baseName = input.value.trim().replace(/[\\/:*?"<>|]/g, "_");
    return baseName || "hasil_sintesis";
}

function downloadFile(filename, text) {
    if (!text) return;
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

function downloadOriginal() {
    const text = document.getElementById("inputText").value;
    if (!text) { alert("Teks input kosong!"); return; }
    downloadFile(`${getDownloadBaseName()}_original.txt`, text);
}

function downloadCurrentPage() {
    if (pages.length === 0) { alert("Tidak ada teks yang di-generate!"); return; }
    downloadFile(`${getDownloadBaseName()}_${currentPageIdx + 1}.txt`, pages[currentPageIdx].join('\n'));
}

function downloadAllPagesIndividual() {
    if (pages.length === 0) {
        alert("Tidak ada halaman untuk diunduh!");
        return;
    }
    if (!confirm(`Terdapat ${pages.length} halaman. Browser Anda mungkin meminta izin untuk mengunduh banyak file. Lanjutkan?`)) {
        return;
    }

    pages.forEach((pageLines, index) => {
        setTimeout(() => downloadFile(`${getDownloadBaseName()}_${index + 1}.txt`, pageLines.join('\n')), index * 300);
    });
}

async function exportPagesToFolder() {
    if (pages.length === 0) {
        alert("Tidak ada halaman untuk diekspor!");
        return;
    }

    if (!window.showDirectoryPicker) {
        alert("Browser ini belum mendukung ekspor langsung ke folder. Gunakan tombol Download All Pages sebagai gantinya.");
        downloadAllPagesIndividual();
        return;
    }

    try {
        let directoryHandle = exportDirectoryHandle;
        if (directoryHandle) {
            let permission = await directoryHandle.queryPermission({ mode: "readwrite" });
            if (permission !== "granted") {
                permission = await directoryHandle.requestPermission({ mode: "readwrite" });
            }
            if (permission !== "granted") directoryHandle = null;
        }

        if (!directoryHandle) {
            directoryHandle = await window.showDirectoryPicker({ mode: "readwrite" });
            exportDirectoryHandle = directoryHandle;
            document.getElementById("exportFolderStatus").textContent = `Folder tujuan: ${directoryHandle.name}`;
        }

        const baseName = getDownloadBaseName();
        for (let index = 0; index < pages.length; index++) {
            const fileHandle = await directoryHandle.getFileHandle(`${baseName}_${index + 1}.txt`, { create: true });
            const writable = await fileHandle.createWritable();
            await writable.write(pages[index].join('\n'));
            await writable.close();
        }

        alert(`${pages.length} halaman berhasil diekspor ke folder yang dipilih.`);
    } catch (error) {
        if (error.name !== "AbortError") alert(`Ekspor gagal: ${error.message}`);
    }
}

processText();
