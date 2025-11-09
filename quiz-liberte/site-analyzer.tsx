"use client"

import { useMemo, useState } from "react"
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { SiteAnalysisResult } from "@/lib/site-analyzer"
import {
  AlertCircle,
  CheckCircle2,
  Globe2,
  History,
  Info,
  Link as LinkIcon,
  Loader2,
  Sparkles,
} from "lucide-react"

interface AnalysisResponse {
  analysis: SiteAnalysisResult
  fetchedUrl: string
  contentType?: string
  truncated?: boolean
}

interface HistoryItem {
  url: string
  verdict: string
  confidence: number
  createdAt: string
}

const exampleSites: Array<{ label: string; url: string }> = [
  {
    label: "Durable (construtor com IA)",
    url: "https://durable.co/",
  },
  {
    label: "Framer",
    url: "https://www.framer.com/",
  },
  {
    label: "Next.js (site manual)",
    url: "https://nextjs.org/",
  },
]

const gradientByConfidence = (score: number) => {
  if (score >= 70) {
    return "from-purple-600 via-pink-500 to-orange-400"
  }
  if (score >= 40) {
    return "from-blue-600 via-purple-500 to-pink-500"
  }
  return "from-emerald-600 via-teal-500 to-cyan-500"
}

export default function SiteAnalyzer() {
  const [url, setUrl] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<AnalysisResponse | null>(null)
  const [history, setHistory] = useState<HistoryItem[]>([])

  const confidenceColor = useMemo(() => {
    if (!result) return "text-muted-foreground"
    if (result.analysis.confidenceScore >= 70) return "text-purple-300"
    if (result.analysis.confidenceScore >= 40) return "text-blue-300"
    return "text-emerald-300"
  }, [result])

  const handleAnalyze = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!url.trim()) {
      setError("Informe uma URL para análise.")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/analyzer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      })

      const data = (await response.json()) as AnalysisResponse & { error?: string }

      if (!response.ok) {
        throw new Error(data.error || "Não foi possível analisar o site.")
      }

      setResult(data)
      setHistory((previous) => {
        const nextHistory: HistoryItem[] = [
          {
            url: data.fetchedUrl,
            verdict: data.analysis.verdict,
            confidence: data.analysis.confidenceScore,
            createdAt: new Date().toISOString(),
          },
          ...previous,
        ]
        return nextHistory.slice(0, 5)
      })
    } catch (requestError) {
      const message =
        requestError instanceof Error
          ? requestError.message
          : "Ocorreu um erro desconhecido."
      setError(message)
      setResult(null)
    } finally {
      setLoading(false)
    }
  }

  const confidenceGradient = result
    ? gradientByConfidence(result.analysis.confidenceScore)
    : "from-slate-600 to-slate-800"

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-50">
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 opacity-40">
          <div className="absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-purple-600 blur-3xl"></div>
          <div className="absolute bottom-0 right-0 h-80 w-80 translate-x-1/3 translate-y-1/3 rounded-full bg-cyan-500 blur-3xl"></div>
        </div>

        <header className="relative z-10 mx-auto max-w-5xl px-4 pb-12 pt-16">
          <div className="flex flex-col items-center text-center">
            <Badge className="mb-3 bg-slate-800/80 text-purple-200 shadow-lg">
              Detector de Sites com IA
            </Badge>
            <h1 className="text-3xl font-bold tracking-tight text-white sm:text-5xl">
              Analise qualquer site e descubra se foi criado com Inteligência Artificial
            </h1>
            <p className="mt-4 max-w-2xl text-sm text-slate-300 sm:text-base">
              O algoritmo examina a estrutura do HTML, metadados, quantidade de scripts e pistas deixadas por construtores que usam IA.
            </p>
          </div>
        </header>

        <main className="relative z-10 mx-auto flex max-w-5xl flex-col gap-6 px-4 pb-16">
          <Card className="border-slate-800/40 bg-slate-900/70 backdrop-blur">
            <CardHeader className="space-y-4">
              <CardTitle className="flex items-center gap-2 text-lg font-semibold text-white sm:text-xl">
                <Globe2 className="h-5 w-5 text-purple-300" /> Informe o endereço do site
              </CardTitle>
              <CardDescription className="text-slate-400">
                Cole a URL completa ou clique em um dos exemplos rápidos para testar.
              </CardDescription>
              <div className="flex flex-wrap gap-2">
                {exampleSites.map((example) => (
                  <Button
                    key={example.url}
                    type="button"
                    variant="secondary"
                    size="sm"
                    className="bg-slate-800/70 text-slate-100 hover:bg-slate-700/80"
                    onClick={() => setUrl(example.url)}
                  >
                    {example.label}
                  </Button>
                ))}
              </div>
            </CardHeader>
            <CardContent>
              <form className="flex flex-col gap-3 sm:flex-row" onSubmit={handleAnalyze}>
                <Input
                  value={url}
                  onChange={(event) => setUrl(event.target.value)}
                  placeholder="https://exemplo.com"
                  className="h-12 border-slate-700/60 bg-slate-950/60 text-slate-100 placeholder:text-slate-500"
                />
                <Button
                  type="submit"
                  disabled={loading}
                  className="h-12 bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-lg hover:from-purple-500 hover:to-pink-400"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analisando...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Analisar estrutura
                    </>
                  )}
                </Button>
              </form>
              {error && (
                <Alert
                  variant="destructive"
                  className="mt-4 border-red-500/40 bg-red-900/30 text-red-100"
                >
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Ops!</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {result && (
            <div className="grid gap-6 lg:grid-cols-3">
              <Card className="border-slate-800/50 bg-slate-900/80 backdrop-blur lg:col-span-2">
                <CardHeader className="space-y-2">
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Sparkles className="h-5 w-5 text-purple-300" /> Resultado da análise
                  </CardTitle>
                  <CardDescription className="text-slate-400">
                    {result.fetchedUrl}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="rounded-xl border border-slate-800/60 bg-gradient-to-r from-slate-950/80 via-slate-900/60 to-slate-950/80 p-6 text-white shadow-xl">
                    <div className={`rounded-lg border border-white/10 bg-black/20 p-4 shadow-inner`}> 
                      <p className="text-sm font-medium uppercase tracking-wide text-slate-300">
                        Veredito
                      </p>
                      <h2 className="mt-1 text-2xl font-bold text-white sm:text-3xl">
                        {result.analysis.verdict}
                      </h2>
                      <p className={`mt-2 text-sm ${confidenceColor}`}>
                        Confiança {result.analysis.confidenceLabel} · {result.analysis.confidenceScore}%
                      </p>
                      <div className="mt-4">
                        <Progress
                          value={result.analysis.confidenceScore}
                          className={`h-3 overflow-hidden bg-slate-800/80`}
                        >
                          {/* Progress component is styled via value prop */}
                        </Progress>
                        <div
                          className={`mt-2 h-2 w-full rounded-full bg-gradient-to-r ${confidenceGradient}`}
                        ></div>
                      </div>
                    </div>
                    <p className="mt-4 text-sm text-slate-300">{result.analysis.summary}</p>
                    {result.truncated && (
                      <Alert className="mt-4 border-amber-500/50 bg-amber-500/10 text-amber-100">
                        <Info className="h-4 w-4" />
                        <AlertTitle>Conteúdo reduzido</AlertTitle>
                        <AlertDescription>
                          O HTML excedia o limite máximo e foi analisado parcialmente.
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <Card className="border-slate-800/50 bg-slate-950/70">
                      <CardHeader className="pb-2">
                        <CardTitle className="flex items-center gap-2 text-base font-semibold text-purple-200">
                          <CheckCircle2 className="h-4 w-4" /> Sinais encontrados
                        </CardTitle>
                        <CardDescription className="text-slate-400">
                          Evidências que indicam uso de automação/IA
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pt-0">
                        {result.analysis.aiSignals.length > 0 ? (
                          <ul className="space-y-2 text-sm text-slate-200">
                            {result.analysis.aiSignals.map((signal, index) => (
                              <li key={`${signal}-${index}`} className="rounded-md border border-purple-500/20 bg-purple-500/10 p-3">
                                {signal}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-sm text-slate-400">
                            Nenhum sinal forte identificado.
                          </p>
                        )}
                      </CardContent>
                    </Card>

                    <Card className="border-slate-800/50 bg-slate-950/70">
                      <CardHeader className="pb-2">
                        <CardTitle className="flex items-center gap-2 text-base font-semibold text-slate-200">
                          <Info className="h-4 w-4" /> Resumo técnico
                        </CardTitle>
                        <CardDescription className="text-slate-400">
                          Indicadores gerais da página analisada
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <ul className="space-y-2 text-sm text-slate-200">
                          {result.analysis.neutralSignals.map((signal, index) => (
                            <li key={`${signal}-${index}`} className="rounded-md border border-slate-700/60 bg-slate-800/50 p-3">
                              {signal}
                            </li>
                          ))}
                          {result.analysis.metadata.generatorTag && (
                            <li className="rounded-md border border-indigo-500/40 bg-indigo-500/10 p-3 text-indigo-200">
                              Meta generator declarado: {result.analysis.metadata.generatorTag}
                            </li>
                          )}
                          {result.analysis.metadata.documentLanguage && (
                            <li className="rounded-md border border-cyan-500/40 bg-cyan-500/10 p-3 text-cyan-100">
                              Idioma do documento: {result.analysis.metadata.documentLanguage}
                            </li>
                          )}
                        </ul>
                      </CardContent>
                    </Card>
                  </div>

                  {result.analysis.metadata.aiKeywordMatches.length > 0 && (
                    <Card className="border-slate-800/50 bg-slate-950/70">
                      <CardHeader className="pb-2">
                        <CardTitle className="flex items-center gap-2 text-base font-semibold text-slate-200">
                          <LinkIcon className="h-4 w-4" /> Palavras-chave detectadas
                        </CardTitle>
                        <CardDescription className="text-slate-400">
                          Trechos do HTML relacionados a IA ou automação
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="flex flex-wrap gap-2">
                          {result.analysis.metadata.aiKeywordMatches.map((match) => (
                            <Badge
                              key={match}
                              variant="secondary"
                              className="bg-slate-800/80 text-slate-100"
                            >
                              {match}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </CardContent>
              </Card>

              <Card className="border-slate-800/50 bg-slate-900/80 backdrop-blur">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-white">
                    <History className="h-5 w-5 text-blue-300" /> Histórico recente
                  </CardTitle>
                  <CardDescription className="text-slate-400">
                    As últimas análises realizadas nesta sessão
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {history.length === 0 ? (
                    <p className="text-sm text-slate-400">
                      Nenhuma análise realizada ainda.
                    </p>
                  ) : (
                    <ScrollArea className="h-64 pr-2">
                      <ul className="space-y-3">
                        {history.map((item) => (
                          <li
                            key={`${item.url}-${item.createdAt}`}
                            className="rounded-lg border border-slate-800/60 bg-slate-950/70 p-3"
                          >
                            <p className="text-xs uppercase tracking-wide text-slate-500">
                              {new Date(item.createdAt).toLocaleString()}
                            </p>
                            <p className="mt-1 text-sm font-medium text-white break-all">
                              {item.url}
                            </p>
                            <p className="mt-2 text-xs text-slate-400">
                              {item.verdict}
                            </p>
                            <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                              <span>Confiança {item.confidence}%</span>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </ScrollArea>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
