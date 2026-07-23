import assert from "node:assert/strict";
import test from "node:test";

async function render(path = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);
  return worker.fetch(
    new Request(`http://localhost${path}`, { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("server-renders the academy shell", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>From Weights to Tokens<\/title>/i);
  assert.match(html, /Model Factory/i);
  assert.match(html, /The learning promise/i);
  assert.match(html, /single-GPU inference/i);
  assert.match(html, /multi-GPU execution/i);
  assert.match(html, /Beginner/);
  assert.match(html, /Expert/);
  assert.match(html, /saved in this browser/i);
  assert.doesNotMatch(html, /codex-preview|react-loading-skeleton|Your site is taking shape/i);
});

test("server-renders direct chapter and replay routes", async () => {
  const chapterResponse = await render("/learn/single-gpu-inference");
  assert.equal(chapterResponse.status, 200);
  const chapterHtml = await chapterResponse.text();
  assert.match(chapterHtml, /Inference on one GPU/);
  assert.match(chapterHtml, /Read the prompt, then extend it/);
  assert.match(chapterHtml, /Glossary \(2\)/);
  assert.match(chapterHtml, /Sources \(1\)/);

  const replayResponse = await render("/replay");
  assert.equal(replayResponse.status, 200);
  const replayHtml = await replayResponse.text();
  assert.match(replayHtml, /One prompt, end to end/);
  assert.match(replayHtml, /System view/);
  assert.match(replayHtml, /GPU view/);
});
