const zstd = require('@bokuweb/zstd-wasm');
const fs = require('fs');

const FILES = {
    DICT: "./data/zstd_dictionary.dict",
    UNCOMPRESSED_FILE: "./data/sample.html",
    COMPRESSED_FILE: "./data/sample.zst"
};

(async() => {
    await zstd.init();
    const dictBuffer = fs.readFileSync(FILES.DICT);

    let i = 0;
    while (true) {
        console.clear();
        console.log(++i);
        // break;
        const compressedBuffer = fs.readFileSync(FILES.COMPRESSED_FILE);
        const decompressedBuffer = zstd.decompressUsingDict(zstd.createDCtx(), compressedBuffer, dictBuffer);
        Buffer.from(decompressedBuffer).toString();
    }
})();