const Koa = require('koa')
const fs = require('fs');
const zstd = require('@bokuweb/zstd-wasm');

const FILES = {
    DICT: "./data/zstd_dictionary.dict",
    UNCOMPRESSED_FILE: "./data/sample.html",
    COMPRESSED_FILE: "./data/sample.zst"
}

const dictBuffer = fs.readFileSync(FILES.DICT);

const app = new Koa()

app.use(async (ctx, next) => {
    const reqTime = process.hrtime.bigint();
    await next();
    const elapsedTime = (process.hrtime.bigint() - reqTime)/1000n;

    console.log(`${(new Date()).toISOString()} ${ctx.request.ip} ${ctx.method} ${ctx.url} ${ctx.status} ${elapsedTime}µs`);
});

app.use(async (ctx, next) => {
    if (ctx.path === "/compress") {
        // Prepare compressed data for testing, ignore this since we have commit the compressed data in this repo
        const uncompressedBuffer = fs.readFileSync(FILES.UNCOMPRESSED_FILE);

        const compressedBuffer = zstd.compressUsingDict(zstd.createCCtx(), uncompressedBuffer, dictBuffer);

        fs.writeFileSync(FILES.COMPRESSED_FILE, compressedBuffer);
        ctx.body = "Compressed!";
    } else if (ctx.path === "/decompress") {
        // Perform decompression

        // 1). Read compressed data from file
        const compressedBuffer = fs.readFileSync(FILES.COMPRESSED_FILE);

        // 2). Decompress using dictionary
        const decompressedBuffer = zstd.decompressUsingDict(zstd.createDCtx(), compressedBuffer, dictBuffer);

        // 3). Send decompressed data to client
        ctx.body = Buffer.from(decompressedBuffer).toString();
    } else {
        ctx.body = "It works!";
    }
});

(async() => {
    await zstd.init();
    app.listen(3030, () => {        
        console.log('Server is running at http://localhost:3030')
    })
})();
