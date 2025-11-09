import { NextResponse } from "next/server"

import { analyzeSiteStructure, normalizeUrl } from "@/lib/site-analyzer"

export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as { url?: string }
    const url = body.url

    if (!url || typeof url !== "string") {
      return NextResponse.json(
        { error: "Informe uma URL válida para análise." },
        { status: 400 }
      )
    }

    let normalizedUrl: string
    try {
      normalizedUrl = normalizeUrl(url)
    } catch (error) {
      const message = error instanceof Error ? error.message : "URL inválida"
      return NextResponse.json({ error: message }, { status: 400 })
    }

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 12_000)

    let response: Response
    try {
      response = await fetch(normalizedUrl, {
        method: "GET",
        headers: {
          "User-Agent": "SiteIA-Analyzer/1.0 (+https://example.com)",
          Accept: "text/html,application/xhtml+xml",
        },
        signal: controller.signal,
        redirect: "follow",
        cache: "no-store",
      })
    } catch (error) {
      const message =
        error instanceof Error && error.name === "AbortError"
          ? "A requisição ao site demorou demais. Tente novamente."
          : "Não foi possível conectar ao site informado."
      return NextResponse.json({ error: message }, { status: 408 })
    } finally {
      clearTimeout(timeout)
    }

    if (!response.ok) {
      return NextResponse.json(
        {
          error: `Não foi possível acessar o site (status ${response.status}).`,
        },
        { status: 400 }
      )
    }

    const contentType = response.headers.get("content-type") || ""
    const rawHtml = await response.text()
    const truncatedHtml = rawHtml.slice(0, 600_000)

    const analysis = analyzeSiteStructure(truncatedHtml)

    return NextResponse.json({
      analysis,
      fetchedUrl: normalizedUrl,
      contentType,
      truncated: rawHtml.length > truncatedHtml.length,
    })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erro inesperado ao processar a análise."
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
