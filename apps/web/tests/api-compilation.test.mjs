import { test } from "node:test"
import assert from "node:assert/strict"
import { fileURLToPath } from "node:url"
import ts from "typescript"

test("API compiles and emits JavaScript using the root config consumed by Vercel", () => {
  const configPath = fileURLToPath(new URL("../tsconfig.json", import.meta.url))
  const config = ts.readConfigFile(configPath, ts.sys.readFile)
  assert.equal(config.error, undefined)
  const parsed = ts.parseJsonConfigFileContent(
    config.config,
    ts.sys,
    fileURLToPath(new URL("../", import.meta.url))
  )
  assert.deepEqual(parsed.errors, [])
  // Functions are compiled independently from Vite's referenced projects.
  // Keep output in memory: emitting must not modify the source tree.
  const output = new Map()
  const program = ts.createProgram({
    rootNames: [fileURLToPath(new URL("../api/analytics.ts", import.meta.url))],
    options: {
      ...parsed.options,
      noEmit: false,
      outDir: "/api-compilation-test",
    },
  })
  const diagnostics = ts.getPreEmitDiagnostics(program)
  assert.equal(
    diagnostics.length,
    0,
    ts.formatDiagnosticsWithColorAndContext(diagnostics, {
      getCurrentDirectory: ts.sys.getCurrentDirectory,
      getCanonicalFileName: (name) => name,
      getNewLine: () => "\n",
    })
  )
  const result = program.emit(undefined, (name, content) =>
    output.set(name, content)
  )
  assert.equal(result.emitSkipped, false)
  assert.equal(result.diagnostics.length, 0)
  const api = [...output].find(([name]) =>
    name.replaceAll("\\", "/").endsWith("/api/analytics.js")
  )?.[1]
  assert.ok(api)
  assert.match(api, /analytics-handler\.js/)
  assert.match(api, /seo\.js/)
  assert.ok(
    [...output.values()].every(
      (source) => !/from ["'][^"']+\.ts["']/.test(source)
    )
  )
})
