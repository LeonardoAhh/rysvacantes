import { readFileSync, existsSync } from "node:fs"
import { resolve, dirname } from "node:path"
import { fileURLToPath } from "node:url"
import ts from "typescript"

// Exercise production modules with explicit test doubles, never the live client.
export function sourceLoader(doubles = {}, globals = {}) {
  const cache = new Map()
  const root = fileURLToPath(new URL("../src/", import.meta.url))
  function load(file) {
    const absolute = file.startsWith("@/")
      ? resolve(root, file.slice(2))
      : resolve(file)
    const path = existsSync(absolute) ? absolute : `${absolute}.ts`
    if (cache.has(path)) return cache.get(path).exports
    const module = { exports: {} }
    cache.set(path, module)
    const code = ts.transpileModule(readFileSync(path, "utf8"), {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2023,
      },
    }).outputText
    const require = (id) => {
      if (Object.hasOwn(doubles, id)) return doubles[id]
      return load(id.startsWith(".") ? resolve(dirname(path), id) : id)
    }
    new Function("require", "module", "exports", ...Object.keys(globals), code)(
      require,
      module,
      module.exports,
      ...Object.values(globals)
    )
    return module.exports
  }
  return load
}
