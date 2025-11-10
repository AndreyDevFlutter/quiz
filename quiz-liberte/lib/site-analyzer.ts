export interface SiteAnalysisResult {
  verdict: string
  confidenceScore: number
  confidenceLabel: "Alta" | "Média" | "Baixa"
  summary: string
  aiSignals: string[]
  neutralSignals: string[]
  metadata: {
    wordCount: number
    scriptCount: number
    styleTagCount: number
    imageCount: number
    linkCount: number
    textToHtmlRatio: number
    aiKeywordMatches: string[]
    generatorTag?: string
    documentLanguage?: string
  }
}

interface KeywordSignal {
  pattern: RegExp
  description: string
  weight: number
}

const AI_KEYWORD_SIGNALS: KeywordSignal[] = [
  {
    pattern: /<meta[^>]+name=["']generator["'][^>]+durable/gi,
    description: "Meta generator faz referência ao construtor Durable AI",
    weight: 3,
  },
  {
    pattern: /<meta[^>]+name=["']generator["'][^>]+10web/gi,
    description: "Meta generator indica 10Web – plataforma com geração por IA",
    weight: 3,
  },
  {
    pattern: /<meta[^>]+name=["']generator["'][^>]+framer/gi,
    description: "Meta generator aponta para o editor Framer (com recursos de IA)",
    weight: 2.5,
  },
  {
    pattern: /<meta[^>]+name=["']generator["'][^>]+wix adi/gi,
    description: "Meta generator menciona Wix ADI (assistente com IA)",
    weight: 3,
  },
  {
    pattern: /powered by durable ai/gi,
    description: "Texto 'Powered by Durable AI' encontrado",
    weight: 2.5,
  },
  {
    pattern: /framer ai|ai site generator|framer\.site\/ai/gi,
    description: "Referências diretas ao construtor Framer AI",
    weight: 2,
  },
  {
    pattern: /data-ai=/gi,
    description: "Atributos data-ai encontrados na marcação",
    weight: 1.5,
  },
  {
    pattern: /ai-generated/gi,
    description: "Marcadores explícitos 'ai-generated'",
    weight: 2,
  },
  {
    pattern: /builder\.io|cdn\.builder\.io/gi,
    description: "Scripts do Builder.io detectados (plataforma com geração por IA)",
    weight: 1.5,
  },
  {
    pattern: /"_ai"|"ai-"|"-ai"/gi,
    description: "Classes ou IDs com sufixo/prefixo '-ai'",
    weight: 1,
  },
  {
    pattern: /durable\.co|useframer\.com|10web\.io|bookmark\.com|butterfly ai/gi,
    description: "Links para construtores populares que usam IA",
    weight: 1.5,
  },
]

const GENERATOR_TAG_REGEX = /<meta[^>]+name=["']generator["'][^>]+content=["']([^"']+)["'][^>]*>/i
const HTML_LANG_REGEX = /<html[^>]+lang=["']([^"']+)["'][^>]*>/i

const STRIP_TAGS_REGEX = /<[^>]+>/g
const WHITESPACE_REGEX = /\s+/g

export function analyzeSiteStructure(html: string): SiteAnalysisResult {
  const limitedHtml = html.slice(0, 400_000)
  const normalizedHtml = limitedHtml.toLowerCase()

  const aiSignals: string[] = []
  const aiKeywordMatches: string[] = []
  let score = 0

  for (const signal of AI_KEYWORD_SIGNALS) {
    const matches = normalizedHtml.match(signal.pattern)
    if (matches && matches.length > 0) {
      aiSignals.push(signal.description)
      const uniqueMatches = Array.from(new Set(matches.map((match) => match.trim()))).slice(0, 5)
      aiKeywordMatches.push(...uniqueMatches)
      score += signal.weight * matches.length
    }
  }

  const scriptCount = (limitedHtml.match(/<script\b/gi) || []).length
  const styleTagCount = (limitedHtml.match(/<style\b/gi) || []).length
  const imageCount = (limitedHtml.match(/<img\b/gi) || []).length
  const linkCount = (limitedHtml.match(/<link\b/gi) || []).length

  const textOnly = limitedHtml.replace(STRIP_TAGS_REGEX, " ")
  const wordCount = textOnly.replace(WHITESPACE_REGEX, " ").split(" ").filter(Boolean).length
  const textToHtmlRatio = Number((wordCount / Math.max(limitedHtml.length, 1)).toFixed(3))

  if (scriptCount > 40) {
    aiSignals.push("Página com grande quantidade de scripts (mais de 40)")
    score += 1
  } else if (scriptCount > 25) {
    aiSignals.push("Volume elevado de scripts (mais de 25)")
    score += 0.5
  }

  if (textToHtmlRatio < 0.08) {
    aiSignals.push("Conteúdo com baixa densidade de texto, comum em páginas geradas automaticamente")
    score += 1
  }

  const generatorMatch = limitedHtml.match(GENERATOR_TAG_REGEX)
  const generatorTag = generatorMatch ? generatorMatch[1] : undefined

  if (generatorTag) {
    aiSignals.push(`Meta generator declarado: "${generatorTag}"`)
    score += 1.5
  }

  const languageMatch = limitedHtml.match(HTML_LANG_REGEX)
  const documentLanguage = languageMatch ? languageMatch[1] : undefined

  const neutralSignals: string[] = []
  neutralSignals.push(`Scripts encontrados: ${scriptCount}`)
  neutralSignals.push(`Folhas de estilo embutidas: ${styleTagCount}`)
  neutralSignals.push(`Imagens encontradas: ${imageCount}`)
  neutralSignals.push(`Links externos/estilos: ${linkCount}`)
  neutralSignals.push(`Total aproximado de palavras: ${wordCount}`)
  neutralSignals.push(`Relação texto/HTML: ${textToHtmlRatio}`)

  const maxScore = 15
  const normalizedScore = Math.max(0, Math.min(1, score / maxScore))
  const confidenceScore = Math.round(normalizedScore * 100)

  let confidenceLabel: SiteAnalysisResult["confidenceLabel"] = "Baixa"
  if (confidenceScore >= 70) {
    confidenceLabel = "Alta"
  } else if (confidenceScore >= 40) {
    confidenceLabel = "Média"
  }

  let verdict: string
  let summary: string

  if (confidenceScore >= 70) {
    verdict = "Provavelmente criado com auxílio de IA"
    summary =
      "Vários sinais característicos de construtores com IA foram detectados na estrutura da página."
  } else if (confidenceScore >= 40) {
    verdict = "Possivelmente criado com IA"
    summary =
      "Alguns indícios de automação foram encontrados, mas ainda há elementos típicos de desenvolvimento manual."
  } else {
    verdict = "Poucos sinais de automação por IA"
    summary =
      "A estrutura não apresenta indícios fortes de ferramentas automáticas. O site pode ter sido criado manualmente."
  }

  const uniqueKeywordMatches = Array.from(new Set(aiKeywordMatches)).slice(0, 20)

  return {
    verdict,
    confidenceScore,
    confidenceLabel,
    summary,
    aiSignals,
    neutralSignals,
    metadata: {
      wordCount,
      scriptCount,
      styleTagCount,
      imageCount,
      linkCount,
      textToHtmlRatio,
      aiKeywordMatches: uniqueKeywordMatches,
      generatorTag,
      documentLanguage,
    },
  }
}

export function normalizeUrl(inputUrl: string): string {
  const trimmed = inputUrl.trim()
  if (!trimmed) {
    throw new Error("Informe uma URL válida")
  }

  let normalized = trimmed
  if (!/^https?:\/\//i.test(normalized)) {
    normalized = `https://${normalized}`
  }

  const url = new URL(normalized)
  if (!url.hostname.includes(".")) {
    throw new Error("Informe um domínio válido")
  }

  return url.toString()
}
