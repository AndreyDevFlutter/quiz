"use client"

import { useSearchParams } from "next/navigation"
import { Suspense, useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

// Sistema de detecção de país e moeda
const getCurrencyByCountry = (country: string) => {
  const currencyMap: Record<
    string,
    { symbol: string; code: string; rate: number; originalPrice: number; salePrice: number }
  > = {
    // Europa
    FR: { symbol: "€", code: "EUR", rate: 0.92, originalPrice: 297, salePrice: 97 },
    DE: { symbol: "€", code: "EUR", rate: 0.92, originalPrice: 297, salePrice: 97 },
    ES: { symbol: "€", code: "EUR", rate: 0.92, originalPrice: 297, salePrice: 97 },
    IT: { symbol: "€", code: "EUR", rate: 0.92, originalPrice: 297, salePrice: 97 },
    PT: { symbol: "€", code: "EUR", rate: 0.92, originalPrice: 297, salePrice: 97 },
    NL: { symbol: "€", code: "EUR", rate: 0.92, originalPrice: 297, salePrice: 97 },
    BE: { symbol: "€", code: "EUR", rate: 0.92, originalPrice: 297, salePrice: 97 },
    AT: { symbol: "€", code: "EUR", rate: 0.92, originalPrice: 297, salePrice: 97 },
    CH: { symbol: "CHF", code: "CHF", rate: 0.89, originalPrice: 264, salePrice: 86 },

    // Amérique du Nord
    US: { symbol: "$", code: "USD", rate: 1, originalPrice: 297, salePrice: 97 },
    CA: { symbol: "C$", code: "CAD", rate: 1.35, originalPrice: 401, salePrice: 131 },

    // Amérique du Sud
    BR: { symbol: "R$", code: "BRL", rate: 5.2, originalPrice: 1544, salePrice: 504 },
    AR: { symbol: "ARS$", code: "ARS", rate: 350, originalPrice: 103950, salePrice: 33950 },
    CL: { symbol: "CLP$", code: "CLP", rate: 850, originalPrice: 252450, salePrice: 82450 },
    CO: { symbol: "COP$", code: "COP", rate: 4200, originalPrice: 1247400, salePrice: 407400 },
    MX: { symbol: "MX$", code: "MXN", rate: 18, originalPrice: 5346, salePrice: 1746 },
    PE: { symbol: "S/", code: "PEN", rate: 3.7, originalPrice: 1099, salePrice: 359 },

    // Autres
    GB: { symbol: "£", code: "GBP", rate: 0.79, originalPrice: 235, salePrice: 77 },
    AU: { symbol: "A$", code: "AUD", rate: 1.52, originalPrice: 451, salePrice: 147 },
    JP: { symbol: "¥", code: "JPY", rate: 150, originalPrice: 44550, salePrice: 14550 },
    IN: { symbol: "₹", code: "INR", rate: 83, originalPrice: 24651, salePrice: 8051 },
    ZA: { symbol: "R", code: "ZAR", rate: 18.5, originalPrice: 5495, salePrice: 1795 },
  }

  return currencyMap[country] || currencyMap["US"] // Default to USD
}

const getCountryFromIP = async (): Promise<string> => {
  try {
    // Utilise plusieurs services pour plus de fiabilité
    const services = ["https://ipapi.co/country_code/", "https://api.country.is/", "https://ipinfo.io/country"]

    for (const service of services) {
      try {
        const response = await fetch(service)
        if (response.ok) {
          const data = await response.text()
          const country = data.trim().toUpperCase()
          if (country && country.length === 2) {
            return country
          }
        }
      } catch (error) {
        console.log(`Service ${service} failed:`, error)
        continue
      }
    }

    // Fallback: essayer de détecter via timezone
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
    const timezoneCountryMap: Record<string, string> = {
      "Europe/Paris": "FR",
      "Europe/London": "GB",
      "Europe/Berlin": "DE",
      "Europe/Madrid": "ES",
      "Europe/Rome": "IT",
      "Europe/Lisbon": "PT",
      "America/New_York": "US",
      "America/Los_Angeles": "US",
      "America/Sao_Paulo": "BR",
      "America/Argentina/Buenos_Aires": "AR",
      "America/Mexico_City": "MX",
      "America/Bogota": "CO",
      "America/Lima": "PE",
      "America/Santiago": "CL",
      "Australia/Sydney": "AU",
      "Asia/Tokyo": "JP",
      "Asia/Kolkata": "IN",
      "Africa/Johannesburg": "ZA",
    }

    return timezoneCountryMap[timezone] || "US"
  } catch (error) {
    console.error("Error detecting country:", error)
    return "US" // Default fallback
  }
}

function VSLContent() {
  const searchParams = useSearchParams()
  const profil = searchParams.get("profil")
  const [isVisible, setIsVisible] = useState(false)
  const [isRedirecting, setIsRedirecting] = useState(false)
  const [currency, setCurrency] = useState({ symbol: "$", code: "USD", rate: 1, originalPrice: 297, salePrice: 97 })
  const [country, setCountry] = useState("US")
  const [isLoadingCurrency, setIsLoadingCurrency] = useState(true)
  const [timeLeft, setTimeLeft] = useState(25 * 60) // 25 minutes en secondes
  const [spotsLeft, setSpotsLeft] = useState(7) // Places restantes

  let profileData = {}
  if (profil) {
    try {
      profileData = JSON.parse(decodeURIComponent(profil))
    } catch (error) {
      console.error("Erreur parsing profil:", error)
    }
  }

  useEffect(() => {
    setIsVisible(true)

    // Timer countdown
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    // Simuler la diminution des places
    const spotsTimer = setInterval(() => {
      setSpotsLeft((prev) => {
        if (prev <= 3) return prev // Garder au minimum 3 places
        return Math.random() > 0.7 ? prev - 1 : prev
      })
    }, 45000) // Toutes les 45 secondes

    // Détecter le pays et ajuster la devise
    const detectCountryAndCurrency = async () => {
      try {
        const detectedCountry = await getCountryFromIP()
        const currencyInfo = getCurrencyByCountry(detectedCountry)

        setCountry(detectedCountry)
        setCurrency(currencyInfo)
        setIsLoadingCurrency(false)

        console.log(`Pays détecté: ${detectedCountry}, Devise: ${currencyInfo.code}`)
      } catch (error) {
        console.error("Erreur détection pays:", error)
        setIsLoadingCurrency(false)
      }
    }

    detectCountryAndCurrency()

    return () => {
      clearInterval(timer)
      clearInterval(spotsTimer)
    }
  }, [])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const formatPrice = (price: number) => {
    if (currency.code === "JPY" || currency.code === "CLP" || currency.code === "ARS" || currency.code === "COP") {
      // Pas de décimales pour ces devises
      return `${currency.symbol}${price.toLocaleString()}`
    }
    return `${currency.symbol}${price.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
  }

  const handleRedirectToCheckout = () => {
    setIsRedirecting(true)

    // Petit délai pour l'animation puis redirection vers le checkout Hotmart
    setTimeout(() => {
      window.location.href =
        "https://pay.hotmart.com/N99430978X?off=522fxh10&checkoutMode=10&utm_source=organic&utm_campaign=&utm_medium=&utm_content=&utm_term=&xcod=organichQwK21wXxRhQwK21wXxRhQwK21wXxRhQwK21wXxR&sck=organichQwK21wXxRhQwK21wXxRhQwK21wXxRhQwK21wXxR&bid=1750357057741"
    }, 1000)
  }

  // Témoignages avec preuves sociales
  const testimonials = [
    {
      name: "Sarah M.",
      location: "Paris, France",
      avatar: "/placeholder.svg?height=50&width=50&text=SM",
      quote: "J'ai gagné mes premiers 1200€ en 3 semaines avec la Méthode SIA ! Je n'arrive pas à y croire 😍",
      earnings: "1,200€ en 3 semaines",
      verified: true,
      timeAgo: "Il y a 2 heures",
    },
    {
      name: "Julie B.",
      location: "Lyon, France",
      avatar: "/placeholder.svg?height=50&width=50&text=JB",
      quote: "Enfin une méthode qui marche ! 850€ ce mois-ci et je commence à peine. Merci SIA ! 🙏",
      earnings: "850€ ce mois",
      verified: true,
      timeAgo: "Il y a 4 heures",
    },
    {
      name: "Camille T.",
      location: "Marseille, France",
      avatar: "/placeholder.svg?height=50&width=50&text=CT",
      quote: "Je travaillais 50h/semaine pour 1800€. Maintenant je gagne 2400€ en travaillant de chez moi ! 🏠",
      earnings: "2,400€/mois",
      verified: true,
      timeAgo: "Il y a 6 heures",
    },
    {
      name: "Emma L.",
      location: "Toulouse, France",
      avatar: "/placeholder.svg?height=50&width=50&text=EL",
      quote: "Ma première vente à 97€ hier soir ! J'ai pleuré de joie. Cette méthode change vraiment la vie 💕",
      earnings: "Premier succès",
      verified: true,
      timeAgo: "Il y a 8 heures",
    },
  ]

  // Statistiques en temps réel
  const liveStats = [
    { label: "Libertéuses actives", value: "12,847", icon: "👥" },
    { label: "Revenus générés ce mois", value: "€847,392", icon: "💰" },
    { label: "Taux de réussite", value: "94.7%", icon: "📈" },
    { label: "Satisfaction client", value: "4.9/5", icon: "⭐" },
  ]

  if (isRedirecting) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-green-900 to-emerald-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-black/80 backdrop-blur-sm border border-green-500/30">
          <CardContent className="p-8 text-center">
            <div className="mb-6">
              <div className="text-4xl mb-4 animate-spin">💳</div>
              <h2 className="text-xl font-semibold mb-2 text-white">
                Redirection vers le
                <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                  {" "}
                  Checkout Sécurisé
                </span>
                ...
              </h2>
              <p className="text-green-200 text-sm">Finalise ton achat de la Méthode SIA</p>
              <p className="text-green-300 text-xs mt-2">
                Pays: {country} | Devise: {currency.code}
              </p>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-3 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-green-500 to-emerald-500 w-full animate-pulse" />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 relative overflow-hidden">
      {/* Timer de urgência fixo no topo */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-red-600 to-orange-600 text-white py-2 px-4 shadow-lg">
        <div className="max-w-4xl mx-auto flex items-center justify-between text-sm">
          <div className="flex items-center space-x-2">
            <span className="animate-pulse">🔥</span>
            <span className="font-semibold">OFFRE LIMITÉE</span>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <span>⏰</span>
              <span className="font-mono font-bold">{formatTime(timeLeft)}</span>
            </div>
            <div className="flex items-center space-x-1">
              <span>🎯</span>
              <span className="font-bold">{spotsLeft} places restantes</span>
            </div>
          </div>
        </div>
      </div>

      {/* Effets de fond futuristes */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-10 w-32 h-32 bg-purple-500 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-cyan-500 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-24 h-24 bg-pink-500 rounded-full blur-2xl animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10 p-4 pt-20">
        {/* Header */}
        <div
          className={`pt-8 pb-6 text-center transition-all duration-1000 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
        >
          <div className="max-w-2xl mx-auto">
            <div className="mb-2 flex items-center justify-center space-x-2">
              <span className="inline-block px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-semibold rounded-full">
                MÉTHODE SIA™ EXCLUSIVE
              </span>
              {!isLoadingCurrency && (
                <span className="inline-block px-2 py-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-semibold rounded-full">
                  🌍 {country} | {currency.code}
                </span>
              )}
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">🎥 Ta Vidéo Personnalisée est Prête !</h1>
            <p className="text-purple-200 text-lg">
              Basée sur tes réponses au quiz, découvre exactement comment appliquer la Méthode SIA à ton profil unique
            </p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto space-y-6">
          {/* Video Section */}
          <Card
            className={`bg-black/90 backdrop-blur-sm border border-purple-500/30 shadow-2xl transition-all duration-1000 delay-200 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
          >
            <CardContent className="p-6">
              <div className="aspect-video bg-black rounded-lg overflow-hidden mb-6 relative">
                <video
                  className="w-full h-full object-cover"
                  controls
                  autoPlay
                  muted
                  playsInline
                  poster="/placeholder.svg?height=400&width=800&text=Méthode+SIA+VSL"
                  preload="auto"
                >
                  <source src="/videos/sia-vsl.mp4" type="video/mp4" />
                  Votre navigateur ne supporte pas la lecture de vidéos.
                </video>

                {/* Overlay avec informations */}
                <div className="absolute top-4 left-4 bg-black/80 backdrop-blur-sm rounded-lg px-3 py-2">
                  <span className="text-white text-sm font-semibold">🎯 Vidéo personnalisée pour toi</span>
                </div>

                {/* Indicateur autoplay */}
                <div className="absolute top-4 right-4 bg-red-500/80 backdrop-blur-sm rounded-lg px-2 py-1">
                  <span className="text-white text-xs font-semibold">🔴 LIVE</span>
                </div>
              </div>

              {Object.keys(profileData).length > 0 && (
                <div className="bg-gradient-to-r from-gray-800/80 to-gray-700/80 rounded-lg p-4 mb-6 border border-purple-500/30">
                  <h3 className="font-semibold text-white mb-2 flex items-center">
                    <span className="mr-2">📊</span>
                    Ton profil analysé :
                  </h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {Object.entries(profileData).map(([key, value], index) => (
                      <div key={index} className="bg-black/40 rounded px-2 py-1 border border-gray-600/30">
                        <span className="text-purple-300">Q{key}:</span>
                        <span className="text-gray-200 ml-1">{value as string}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Statistiques en temps réel */}
          <Card
            className={`bg-black/90 backdrop-blur-sm border border-green-500/30 shadow-2xl transition-all duration-1000 delay-300 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
          >
            <CardContent className="p-6">
              <h3 className="text-xl font-bold text-white mb-4 text-center flex items-center justify-center">
                <span className="mr-2">📊</span>
                Statistiques en temps réel
                <span className="ml-2 text-green-400 animate-pulse">●</span>
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {liveStats.map((stat, index) => (
                  <div
                    key={index}
                    className="bg-gradient-to-r from-gray-800/60 to-gray-700/60 rounded-lg p-4 text-center border border-gray-600/30"
                  >
                    <div className="text-2xl mb-2">{stat.icon}</div>
                    <div className="text-2xl font-bold text-green-400 mb-1">{stat.value}</div>
                    <div className="text-xs text-gray-300">{stat.label}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Témoignages avec preuves sociales */}
          <Card
            className={`bg-black/90 backdrop-blur-sm border border-purple-500/30 shadow-2xl transition-all duration-1000 delay-400 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
          >
            <CardContent className="p-6">
              <h3 className="text-xl font-bold text-white mb-6 text-center flex items-center justify-center">
                <span className="mr-2">💬</span>
                Résultats de nos Libertéuses
                <span className="ml-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">LIVE</span>
              </h3>
              <div className="space-y-4">
                {testimonials.map((testimonial, index) => (
                  <div
                    key={index}
                    className="bg-gradient-to-r from-gray-800/60 to-gray-700/60 rounded-lg p-4 border border-gray-600/30 hover:border-purple-500/50 transition-all duration-300"
                  >
                    <div className="flex items-start space-x-4">
                      <Avatar className="w-12 h-12 border-2 border-purple-500/30">
                        <AvatarImage src={testimonial.avatar || "/placeholder.svg"} />
                        <AvatarFallback className="bg-gradient-to-r from-purple-400 to-pink-400 text-white text-sm">
                          {testimonial.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <div className="flex items-center space-x-2">
                              <h4 className="font-semibold text-white text-sm">{testimonial.name}</h4>
                              {testimonial.verified && <span className="text-green-400 text-xs">✓ Vérifié</span>}
                            </div>
                            <p className="text-xs text-gray-400">{testimonial.location}</p>
                          </div>
                          <div className="text-right">
                            <div className="bg-green-500/20 text-green-400 text-xs px-2 py-1 rounded-full font-semibold">
                              {testimonial.earnings}
                            </div>
                            <p className="text-xs text-gray-500 mt-1">{testimonial.timeAgo}</p>
                          </div>
                        </div>
                        <p className="text-sm text-gray-200 italic">"{testimonial.quote}"</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Benefits Section */}
          <Card
            className={`bg-black/90 backdrop-blur-sm border border-purple-500/30 shadow-2xl transition-all duration-1000 delay-500 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
          >
            <CardContent className="p-6">
              <h3 className="text-xl font-bold text-white mb-4 text-center">
                🎯 Ce que tu vas découvrir dans cette vidéo exclusive
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-start space-x-3 p-3 bg-gradient-to-r from-purple-800/40 to-transparent rounded-lg border border-purple-600/20">
                  <div className="text-2xl">✨</div>
                  <div>
                    <h4 className="font-semibold text-white text-sm">Ta stratégie personnalisée</h4>
                    <p className="text-purple-200 text-xs">Adaptée à ton profil et tes objectifs</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-3 bg-gradient-to-r from-pink-800/40 to-transparent rounded-lg border border-pink-600/20">
                  <div className="text-2xl">🚀</div>
                  <div>
                    <h4 className="font-semibold text-white text-sm">Plan d'action concret</h4>
                    <p className="text-purple-200 text-xs">Étapes précises pour commencer dès aujourd'hui</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-3 bg-gradient-to-r from-cyan-800/40 to-transparent rounded-lg border border-cyan-600/20">
                  <div className="text-2xl">💎</div>
                  <div>
                    <h4 className="font-semibold text-white text-sm">Méthode SIA complète</h4>
                    <p className="text-purple-200 text-xs">Tous les secrets pour réussir en ligne</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-3 bg-gradient-to-r from-green-800/40 to-transparent rounded-lg border border-green-600/20">
                  <div className="text-2xl">🎁</div>
                  <div>
                    <h4 className="font-semibold text-white text-sm">Bonus exclusifs</h4>
                    <p className="text-purple-200 text-xs">Outils et ressources pour accélérer tes résultats</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Price & Offer Section */}
          <Card
            className={`bg-gradient-to-r from-orange-900/90 to-red-900/90 backdrop-blur-sm border border-orange-500/30 shadow-2xl transition-all duration-1000 delay-600 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
          >
            <CardContent className="p-6 text-center">
              <div className="mb-4">
                <span className="text-orange-300 text-sm font-semibold">
                  🔥 OFFRE LIMITÉE - {spotsLeft} PLACES RESTANTES
                </span>
              </div>
              {isLoadingCurrency ? (
                <div className="mb-4">
                  <div className="animate-pulse">
                    <div className="h-8 bg-gray-600 rounded w-32 mx-auto mb-2"></div>
                    <div className="h-10 bg-gray-600 rounded w-24 mx-auto"></div>
                  </div>
                </div>
              ) : (
                <div className="mb-4">
                  <span className="text-3xl font-bold text-white line-through opacity-60">
                    {formatPrice(currency.originalPrice)}
                  </span>
                  <span className="text-4xl font-bold text-green-400 ml-4">{formatPrice(currency.salePrice)}</span>
                </div>
              )}
              <p className="text-orange-200 text-sm">
                Prix spécial pour les premières Libertéuses - Cette offre expire dans {formatTime(timeLeft)} !
              </p>
            </CardContent>
          </Card>

          {/* CTA Section */}
          <div
            className={`text-center transition-all duration-1000 delay-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
          >
            <Card className="bg-gradient-to-r from-green-900/90 to-emerald-900/90 backdrop-blur-sm border border-green-500/30 shadow-2xl">
              <CardContent className="p-8">
                <div className="mb-4">
                  <div className="text-4xl mb-2">💳</div>
                  <h2 className="text-2xl font-bold text-white mb-2">Prête à transformer ta vie ?</h2>
                  <p className="text-green-200 mb-6">
                    Accès immédiat à la Méthode SIA complète. Plus de 1000 femmes ont déjà changé leur vie !
                  </p>
                </div>

                <Button
                  onClick={handleRedirectToCheckout}
                  disabled={isLoadingCurrency}
                  className={`w-full max-w-md mx-auto bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white py-6 text-xl font-bold rounded-xl shadow-lg shadow-green-500/25 border-0 transform hover:scale-105 transition-all duration-300 ${
                    isLoadingCurrency ? "opacity-50 cursor-not-allowed" : "animate-pulse"
                  }`}
                >
                  {isLoadingCurrency
                    ? "⏳ Chargement..."
                    : `💎 ACHETER MAINTENANT - ${formatPrice(currency.salePrice)} SEULEMENT`}
                </Button>

                <div className="mt-4 flex justify-center items-center space-x-4 text-xs text-green-300">
                  <span>🔒 Paiement sécurisé</span>
                  <span>•</span>
                  <span>✨ Accès immédiat</span>
                  <span>•</span>
                  <span>💰 Garantie 30 jours</span>
                </div>

                <div className="mt-4 bg-red-500/20 border border-red-500/30 rounded-lg p-3">
                  <p className="text-red-300 text-sm font-semibold">
                    ⚠️ ATTENTION: Cette offre expire dans {formatTime(timeLeft)} - Plus que {spotsLeft} places !
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Trust indicators */}
          <div
            className={`text-center transition-all duration-1000 delay-800 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
          >
            <div className="flex justify-center items-center space-x-6 text-sm text-purple-300">
              <div className="flex items-center space-x-1">
                <span>⭐</span>
                <span>4.9/5 (2,847 avis)</span>
              </div>
              <div className="flex items-center space-x-1">
                <span>👥</span>
                <span>+12,847 Libertéuses</span>
              </div>
              <div className="flex items-center space-x-1">
                <span>🏆</span>
                <span>Méthode #1 en France</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function VSLPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 flex items-center justify-center">
          <div className="text-white text-center">
            <div className="animate-spin text-4xl mb-4">⚡</div>
            <p>Chargement de ta vidéo personnalisée...</p>
          </div>
        </div>
      }
    >
      <VSLContent />
    </Suspense>
  )
}
