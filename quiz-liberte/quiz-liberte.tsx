"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface Question {
  id: number
  emoji: string
  question: string
  options: Array<{
    text: string
    value: string
  }>
}

const questions: Question[] = [
  {
    id: 1,
    emoji: "😩",
    question: "Tu es fatiguée de ton travail actuel ?",
    options: [
      { text: "Oui, j'en peux plus !", value: "epuisee" },
      { text: "Un peu, ça pourrait être mieux", value: "moderee" },
      { text: "Non, ça va plutôt bien", value: "satisfaite" },
    ],
  },
  {
    id: 2,
    emoji: "💭",
    question: "Que ressens-tu quand tu vois d'autres femmes gagner leur vie en ligne ?",
    options: [
      { text: "De l'inspiration et de l'envie", value: "inspiree" },
      { text: "Un peu de jalousie, je l'avoue", value: "jalouse" },
      { text: "Du scepticisme, c'est trop beau", value: "sceptique" },
    ],
  },
  {
    id: 3,
    emoji: "📱",
    question: "As-tu déjà tenté de gagner de l'argent en ligne ?",
    options: [
      { text: "Oui, mais sans succès", value: "echec" },
      { text: "J'ai essayé quelques trucs", value: "tentative" },
      { text: "Non, jamais osé", value: "debutante" },
    ],
  },
  {
    id: 4,
    emoji: "⏳",
    question: "Combien de temps pourrais-tu investir par jour ?",
    options: [
      { text: "30 minutes max", value: "limite" },
      { text: "1-2 heures", value: "moderee" },
      { text: "Plus de 3 heures", value: "disponible" },
    ],
  },
  {
    id: 5,
    emoji: "😶",
    question: "Es-tu à l'aise pour montrer ton visage en ligne ?",
    options: [
      { text: "Oui, aucun problème !", value: "confiante" },
      { text: "Peut-être, avec le temps", value: "hesitante" },
      { text: "Non, je préfère rester discrète", value: "discrete" },
    ],
  },
  {
    id: 6,
    emoji: "🎯",
    question: "Ton objectif principal aujourd'hui ?",
    options: [
      { text: "Gagner 500€/mois en plus", value: "complement" },
      { text: "Remplacer mon salaire", value: "remplacement" },
      { text: "Devenir vraiment riche", value: "richesse" },
    ],
  },
  {
    id: 7,
    emoji: "🧠",
    question: "Quel mot te représente le plus ?",
    options: [
      { text: "Déterminée", value: "determinee" },
      { text: "Créative", value: "creative" },
      { text: "Prudente", value: "prudente" },
    ],
  },
]

export default function QuizLiberte() {
  const [currentStep, setCurrentStep] = useState(0)
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [clickedButton, setClickedButton] = useState<number | null>(null)

  // Fonction pour jouer un son de feedback
  const playClickSound = () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      oscillator.frequency.setValueAtTime(800, audioContext.currentTime)
      oscillator.frequency.exponentialRampToValueAtTime(1200, audioContext.currentTime + 0.1)

      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1)

      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.1)
    } catch (error) {
      // Fallback silencieux si l'audio n'est pas supporté
    }
  }

  // Fonction pour jouer un son de succès
  const playSuccessSound = () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      oscillator.frequency.setValueAtTime(523, audioContext.currentTime) // Do
      oscillator.frequency.setValueAtTime(659, audioContext.currentTime + 0.1) // Mi
      oscillator.frequency.setValueAtTime(784, audioContext.currentTime + 0.2) // Sol

      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3)

      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.3)
    } catch (error) {
      // Fallback silencieux si l'audio n'est pas supporté
    }
  }

  const handleAnswer = (questionId: number, value: string, buttonIndex: number) => {
    // Animation du bouton cliqué
    setClickedButton(buttonIndex)
    playClickSound()

    setAnswers((prev) => ({ ...prev, [questionId]: value }))

    setTimeout(() => {
      setClickedButton(null)
      if (currentStep < questions.length - 1) {
        setCurrentStep((prev) => prev + 1)
      } else {
        // Dernière question - commencer le chargement
        setIsLoading(true)
        playSuccessSound()
      }
    }, 300)
  }

  useEffect(() => {
    if (isLoading) {
      const interval = setInterval(() => {
        setLoadingProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval)
            // Rediriger vers la VSL avec le profil
            const profileData = encodeURIComponent(JSON.stringify(answers))
            window.location.href = `/diagnostic?profil=${profileData}`
            return 100
          }
          return prev + 2
        })
      }, 100)

      return () => clearInterval(interval)
    }
  }, [isLoading, answers])

  const progressPercentage = ((currentStep + 1) / questions.length) * 100

  // Gradient qui change pendant le chargement
  const getBackgroundGradient = () => {
    if (isLoading && loadingProgress > 50) {
      return "bg-gradient-to-br from-gray-900 via-green-900 to-emerald-900"
    }
    return "bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900"
  }

  if (isLoading) {
    return (
      <div
        className={`min-h-screen ${getBackgroundGradient()} flex items-center justify-center p-4 transition-all duration-2000`}
      >
        <Card className="w-full max-w-md bg-black/80 backdrop-blur-sm border border-purple-500/30">
          <CardContent className="p-8 text-center">
            <div className="mb-6">
              <div className="text-4xl mb-4 animate-pulse">✨</div>
              <h2 className="text-xl font-semibold mb-2 text-white">
                Chargement de ton plan
                <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent"> SIA</span>
                ™...
              </h2>
              <p className="text-purple-200 text-sm">
                La Méthode SIA analyse tes réponses pour créer ton profil unique
              </p>
            </div>

            <div className="mb-6">
              <div className="w-full bg-gray-800 rounded-full h-3 overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ease-out ${
                    loadingProgress > 50
                      ? "bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500"
                      : "bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500"
                  }`}
                  style={{ width: `${loadingProgress}%` }}
                />
              </div>
              <p className="text-sm text-purple-300 mt-2">{loadingProgress}%</p>
            </div>

            {loadingProgress >= 100 && (
              <div className="space-y-4">
                <div className="text-green-400 text-2xl animate-bounce">✅</div>
                <Button
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white py-4 text-lg font-medium shadow-lg shadow-green-500/25 border-0 animate-pulse"
                  onClick={() => {
                    const profileData = encodeURIComponent(JSON.stringify(answers))
                    window.location.href = `/diagnostic?profil=${profileData}`
                  }}
                >
                  🚀 Découvre ta Méthode SIA personnalisée
                </Button>
                <p className="text-xs text-green-300">Ton profil de Libertéuse est prêt !</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  if (currentStep >= questions.length) {
    return null
  }

  const currentQuestion = questions[currentStep]

  return (
    <div
      className={`min-h-screen ${getBackgroundGradient()} flex flex-col relative overflow-hidden transition-all duration-1000`}
    >
      {/* Effets de fond futuristes */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-10 w-32 h-32 bg-purple-500 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-cyan-500 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-24 h-24 bg-pink-500 rounded-full blur-2xl animate-pulse delay-500"></div>
      </div>

      {/* Header avec progression */}
      <div className="p-4 border-b border-purple-500/30 backdrop-blur-sm bg-black/20 relative z-10">
        <div className="max-w-md mx-auto">
          {/* Brand name centered */}
          <div className="text-center mb-4">
            <h1 className="text-2xl font-bold text-white">
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent drop-shadow-lg">
                Méthode SIA™
              </span>
            </h1>
            <p className="text-sm text-purple-200 mt-1 font-medium">Quel type de Libertéuse es-tu ?</p>
          </div>

          {/* Step counter */}
          <div className="flex items-center justify-center mb-3">
            <div className="bg-black/40 backdrop-blur-sm rounded-full px-4 py-2 border border-purple-500/30">
              <span className="text-sm text-purple-300 font-semibold">
                Étape {currentStep + 1} sur {questions.length}
              </span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-gray-800/60 rounded-full h-3 overflow-hidden shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 transition-all duration-700 ease-out shadow-lg"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>

          {/* Progress percentage */}
          <div className="text-center mt-2">
            <span className="text-xs text-purple-300 font-medium">{Math.round(progressPercentage)}% complété</span>
          </div>
        </div>
      </div>

      {/* Question */}
      <div className="flex-1 flex items-center justify-center p-4 relative z-10">
        <Card className="w-full max-w-md bg-black/80 backdrop-blur-sm border border-purple-500/30 shadow-2xl shadow-purple-500/10">
          <CardContent className="p-6">
            <div className="text-center mb-8">
              <div className="mb-2">
                <span className="text-xs bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent font-bold tracking-wider">
                  MÉTHODE SIA
                </span>
              </div>
              <div className="text-5xl mb-4 filter drop-shadow-lg">{currentQuestion.emoji}</div>
              <h2 className="text-xl font-medium leading-relaxed text-white">{currentQuestion.question}</h2>
            </div>

            <div className="space-y-3">
              {currentQuestion.options.map((option, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className={`w-full p-4 h-auto text-left justify-start border-2 border-purple-500/30 bg-gray-900/50 text-white hover:border-purple-400 hover:bg-gradient-to-r hover:from-purple-600 hover:to-pink-600 hover:text-white transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/25 backdrop-blur-sm transform hover:scale-105 ${
                    clickedButton === index ? "scale-95 bg-gradient-to-r from-purple-600 to-pink-600" : ""
                  }`}
                  onClick={() => handleAnswer(currentQuestion.id, option.value, index)}
                >
                  <span className="text-base font-medium">{option.text}</span>
                </Button>
              ))}
            </div>

            <div className="mt-6 text-center">
              <p className="text-xs text-purple-300">Choisis la réponse qui te correspond le mieux 💕</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <div className="p-4 text-center relative z-10">
        <p className="text-xs text-purple-400">Méthode SIA • Quiz 100% gratuit • Résultats personnalisés</p>
      </div>
    </div>
  )
}
