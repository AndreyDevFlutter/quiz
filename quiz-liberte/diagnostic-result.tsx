"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function DiagnosticResult() {
  const [timeLeft, setTimeLeft] = useState(15 * 60) // 15 minutes en secondes
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const testimonials = [
    {
      name: "Julie M.",
      avatar: "/placeholder.svg?height=40&width=40&text=JM",
      quote: "Je me reconnais dans ce profil. Aujourd'hui, je gagne mes premiers 300€/mois.",
      verified: true,
    },
    {
      name: "Anaïs B.",
      avatar: "/placeholder.svg?height=40&width=40&text=AB",
      quote: "J'ai hésité… maintenant je me sens libre.",
      verified: true,
    },
    {
      name: "Chloé T.",
      avatar: "/placeholder.svg?height=40&width=40&text=CT",
      quote: "Ce diagnostic m'a boostée comme jamais.",
      verified: true,
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 relative overflow-hidden">
      {/* Header */}
      <div
        className={`pt-8 pb-6 px-4 text-center transition-all duration-1000 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"} relative z-10`}
      >
        <div className="max-w-md mx-auto">
          <div className="mb-2">
            <span className="inline-block px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-semibold rounded-full">
              MÉTHODE SIA™
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">✅ Voici ton profil personnalisé</h1>
          <p className="text-purple-200 text-sm">Analyse terminée – ta Méthode SIA™ est prête à être activée</p>
        </div>
      </div>

      <div className="px-4 space-y-6 max-w-md mx-auto pb-8 relative z-10">
        {/* Profile Block */}
        <Card
          className={`bg-black/90 backdrop-blur-sm border border-purple-500/30 shadow-2xl transition-all duration-1000 delay-200 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
        >
          <CardContent className="p-6">
            <div className="text-center mb-4">
              <div className="text-4xl mb-3">🎨</div>
              <h2 className="text-xl font-bold text-white mb-3">Profil : Libertéuse Créative</h2>
            </div>
            <div className="bg-gradient-to-r from-gray-800/80 to-gray-700/80 rounded-lg p-4 border-l-4 border-purple-400">
              <p className="text-gray-200 leading-relaxed text-sm">
                Tu es une <strong className="text-purple-300">visionnaire</strong>. Tu as des idées et du potentiel.
                Mais parfois, tu doutes de toi-même. Tu cherches la bonne méthode pour transformer ta créativité en
                revenus concrets.
              </p>
              <div className="mt-3 pt-3 border-t border-gray-600">
                <p className="text-sm">
                  <span className="text-green-400 font-semibold">✨ Ton plus grand atout :</span>{" "}
                  <span className="text-gray-200">Ton imagination</span>
                </p>
                <p className="text-sm mt-1">
                  <span className="text-orange-400 font-semibold">⚠️ Ton frein :</span>{" "}
                  <span className="text-gray-200">Le syndrome de l'imposteur</span>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Plan */}
        <Card
          className={`bg-black/90 backdrop-blur-sm border border-purple-500/30 shadow-2xl transition-all duration-1000 delay-400 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
        >
          <CardContent className="p-6">
            <h3 className="text-xl font-bold text-white mb-6 text-center">🎯 Ton plan d'action en 3 étapes</h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-4 p-3 bg-gradient-to-r from-purple-800/40 to-transparent rounded-lg border border-purple-600/20">
                <div className="flex-shrink-0 w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  1
                </div>
                <div>
                  <h4 className="font-semibold text-white text-sm">⚙️ Découvre la méthode qui respecte ton rythme</h4>
                </div>
              </div>
              <div className="flex items-start space-x-4 p-3 bg-gradient-to-r from-pink-800/40 to-transparent rounded-lg border border-pink-600/20">
                <div className="flex-shrink-0 w-8 h-8 bg-pink-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  2
                </div>
                <div>
                  <h4 className="font-semibold text-white text-sm">
                    🎥 Regarde une vidéo exclusive adaptée à ton profil
                  </h4>
                </div>
              </div>
              <div className="flex items-start space-x-4 p-3 bg-gradient-to-r from-cyan-800/40 to-transparent rounded-lg border border-cyan-600/20">
                <div className="flex-shrink-0 w-8 h-8 bg-cyan-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  3
                </div>
                <div>
                  <h4 className="font-semibold text-white text-sm">
                    🚀 Passe à l'action sans montrer ton visage ni parler à personne
                  </h4>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Testimonials */}
        <Card
          className={`bg-black/90 backdrop-blur-sm border border-purple-500/30 shadow-2xl transition-all duration-1000 delay-600 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
        >
          <CardContent className="p-6">
            <h3 className="text-lg font-bold text-white mb-4 text-center">💬 Elles se reconnaissent aussi</h3>
            <div className="space-y-4">
              {testimonials.map((testimonial, index) => (
                <div
                  key={index}
                  className="flex items-start space-x-3 p-3 bg-gray-800/60 rounded-lg border border-gray-700/50"
                >
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={testimonial.avatar || "/placeholder.svg"} />
                    <AvatarFallback className="bg-gradient-to-r from-purple-400 to-pink-400 text-white text-xs">
                      {testimonial.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="text-sm text-gray-200 italic mb-1">"{testimonial.quote}"</p>
                    <div className="flex items-center space-x-1">
                      <p className="text-xs font-semibold text-purple-300">– {testimonial.name}</p>
                      {testimonial.verified && <span className="text-green-400 text-xs">✓</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Scarcity Block */}
        <Card
          className={`bg-gradient-to-r from-orange-900/80 to-red-900/80 border border-orange-500/30 shadow-2xl transition-all duration-1000 delay-800 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
        >
          <CardContent className="p-4 text-center">
            <div className="mb-2">
              <span className="text-orange-300 text-sm font-semibold">⏳ Accès limité</span>
            </div>
            <p className="text-orange-200 text-sm mb-3">Cette page est disponible pendant encore</p>
            <div className="bg-black/60 rounded-lg p-3 inline-block shadow-sm border border-orange-500/30">
              <div className="text-2xl font-bold text-orange-300 font-mono">{formatTime(timeLeft)}</div>
              <div className="text-xs text-orange-400">minutes restantes</div>
            </div>
          </CardContent>
        </Card>

        {/* CTA Button */}
        <div
          className={`transition-all duration-1000 delay-1000 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
        >
          <Button
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-4 text-lg font-semibold rounded-xl shadow-lg shadow-purple-500/25 border-0 transform hover:scale-105 transition-all duration-300"
            onClick={() => {
              window.location.href = "/vsl-liberte"
            }}
          >
            🎯 Découvrir ma Méthode SIA personnalisée
          </Button>
          <p className="text-center text-xs text-purple-300 mt-2">
            Accès immédiat • 100% personnalisé • Sans engagement
          </p>
        </div>

        {/* Trust indicators */}
        <div
          className={`text-center transition-all duration-1000 delay-1200 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
        >
          <div className="flex justify-center items-center space-x-4 text-xs text-purple-400">
            <span>🔒 Sécurisé</span>
            <span>•</span>
            <span>✨ Méthode SIA™</span>
            <span>•</span>
            <span>💎 Premium</span>
          </div>
        </div>
      </div>

      {/* Effets de fond futuristes */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-10 w-32 h-32 bg-purple-500 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-cyan-500 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-24 h-24 bg-pink-500 rounded-full blur-2xl animate-pulse delay-500"></div>
      </div>
    </div>
  )
}
