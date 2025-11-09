#!/usr/bin/env node
const { spawnSync } = require("node:child_process")
const path = require("node:path")

function hasModule(name) {
  try {
    require.resolve(name)
    return true
  } catch (error) {
    if (error && error.code !== "MODULE_NOT_FOUND") {
      console.warn(`Não foi possível verificar o módulo ${name}:`, error)
    }
    return false
  }
}

function runBinary(binaryPath, args) {
  const result = spawnSync(binaryPath, args, { stdio: "inherit" })
  if (result.error) {
    throw result.error
  }
  const exitCode = typeof result.status === "number" ? result.status : 1
  process.exit(exitCode)
}

const nextBin = path.join(process.cwd(), "node_modules", ".bin", "next")
const tscBin = path.join(process.cwd(), "node_modules", ".bin", "tsc")

if (hasModule("eslint") && hasModule("eslint-config-next")) {
  runBinary(nextBin, ["lint"])
} else {
  console.warn(
    "ESLint não está disponível no ambiente atual; executando verificação de tipos com tsc --noEmit."
  )
  runBinary(tscBin, ["--noEmit"])
}
