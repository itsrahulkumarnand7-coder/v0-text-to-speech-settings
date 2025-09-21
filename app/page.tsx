"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Play, Pause, Square, Volume2, Settings, Globe } from "lucide-react"
import { Separator } from "@/components/ui/separator"

export default function TextToSpeechApp() {
  const [text, setText] = useState(
    "Once upon a time, in a quiet village, there lived a curious child who dreamed of the stars...",
  )
  const [isPlaying, setIsPlaying] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
  const [selectedVoice, setSelectedVoice] = useState<string>("")
  const [selectedLanguage, setSelectedLanguage] = useState<string>("all")
  const [filteredVoices, setFilteredVoices] = useState<SpeechSynthesisVoice[]>([])

  const [speed, setSpeed] = useState([0.6]) // slow
  const [pitch, setPitch] = useState([1.0]) // medium
  const [volume, setVolume] = useState([0.3]) // soft
  const [emotion, setEmotion] = useState("storytelling")

  const [utterance, setUtterance] = useState<SpeechSynthesisUtterance | null>(null)

  const languageOptions = [
    { code: "all", name: "All Languages", flag: "🌐" },
    { code: "en", name: "English", flag: "🇺🇸" },
    { code: "hi", name: "हिंदी (Hindi)", flag: "🇮🇳" },
    { code: "es", name: "Español", flag: "🇪🇸" },
    { code: "fr", name: "Français", flag: "🇫🇷" },
    { code: "de", name: "Deutsch", flag: "🇩🇪" },
    { code: "ja", name: "日本語", flag: "🇯🇵" },
    { code: "ko", name: "한국어", flag: "🇰🇷" },
    { code: "zh", name: "中文", flag: "🇨🇳" },
  ]

  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = speechSynthesis.getVoices()
      setVoices(availableVoices)

      const filtered =
        selectedLanguage === "all"
          ? availableVoices
          : availableVoices.filter((voice) => voice.lang.startsWith(selectedLanguage))

      setFilteredVoices(filtered)

      if (selectedLanguage === "hi" && filtered.length > 0) {
        setSelectedVoice(filtered[0].name)
      } else if (filtered.length > 0 && !selectedVoice) {
        setSelectedVoice(filtered[0].name)
      }
    }

    loadVoices()
    speechSynthesis.addEventListener("voiceschanged", loadVoices)

    return () => {
      speechSynthesis.removeEventListener("voiceschanged", loadVoices)
    }
  }, [selectedVoice, selectedLanguage])

  const hasHindiVoices = () => {
    return voices.some((voice) => voice.lang.startsWith("hi"))
  }

  const setHindiSampleText = () => {
    setText("एक समय की बात है, एक शांत गांव में, एक जिज्ञासु बच्चा रहता था जो सितारों का सपना देखता था...")
  }

  const getEmotionSettings = (emotion: string) => {
    switch (emotion) {
      case "happy":
        return { pitchMultiplier: 1.2, speedMultiplier: 1.1 }
      case "sad":
        return { pitchMultiplier: 0.8, speedMultiplier: 0.8 }
      case "excited":
        return { pitchMultiplier: 1.3, speedMultiplier: 1.2 }
      case "calm":
        return { pitchMultiplier: 0.9, speedMultiplier: 0.9 }
      case "serious":
        return { pitchMultiplier: 0.85, speedMultiplier: 0.95 }
      case "angry":
        return { pitchMultiplier: 1.1, speedMultiplier: 1.15 }
      case "motivational":
        return { pitchMultiplier: 1.1, speedMultiplier: 1.05 }
      case "storytelling":
        return { pitchMultiplier: 1.05, speedMultiplier: 0.85 }
      default:
        return { pitchMultiplier: 1, speedMultiplier: 1 }
    }
  }

  const speak = () => {
    if (speechSynthesis.speaking) {
      speechSynthesis.cancel()
    }

    if (text.trim() === "") return

    const newUtterance = new SpeechSynthesisUtterance(text)
    const selectedVoiceObj = voices.find((voice) => voice.name === selectedVoice)
    const emotionSettings = getEmotionSettings(emotion)

    if (selectedVoiceObj) {
      newUtterance.voice = selectedVoiceObj
    }

    newUtterance.rate = speed[0] * emotionSettings.speedMultiplier
    newUtterance.pitch = pitch[0] * emotionSettings.pitchMultiplier
    newUtterance.volume = volume[0]

    newUtterance.onstart = () => {
      setIsPlaying(true)
      setIsPaused(false)
    }

    newUtterance.onend = () => {
      setIsPlaying(false)
      setIsPaused(false)
    }

    newUtterance.onerror = () => {
      setIsPlaying(false)
      setIsPaused(false)
    }

    setUtterance(newUtterance)
    speechSynthesis.speak(newUtterance)
  }

  const pause = () => {
    if (speechSynthesis.speaking && !speechSynthesis.paused) {
      speechSynthesis.pause()
      setIsPaused(true)
    }
  }

  const resume = () => {
    if (speechSynthesis.paused) {
      speechSynthesis.resume()
      setIsPaused(false)
    }
  }

  const stop = () => {
    speechSynthesis.cancel()
    setIsPlaying(false)
    setIsPaused(false)
  }

  const getSpeedLabel = (value: number) => {
    if (value < 0.7) return "Slow"
    if (value > 1.3) return "Fast"
    return "Normal"
  }

  const getPitchLabel = (value: number) => {
    if (value < 0.8) return "Low"
    if (value > 1.2) return "High"
    return "Medium"
  }

  const getVolumeLabel = (value: number) => {
    if (value < 0.4) return "Soft"
    if (value > 0.7) return "Loud"
    return "Medium"
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Text-to-Speech</h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Convert your text into natural-sounding speech with advanced voice controls
          </p>
          {!hasHindiVoices() && (
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3 text-sm text-amber-800 dark:text-amber-200">
              <strong>Hindi Support:</strong> No Hindi voices detected on your system. Try installing Hindi language
              pack in your OS settings for better Hindi support.
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Text Input */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Volume2 className="h-5 w-5" />
                  Text Input
                </CardTitle>
                <CardDescription>Enter the text you want to convert to speech</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="Enter your text here..."
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="min-h-[200px] text-base leading-relaxed"
                />

                <div className="flex items-center gap-2 flex-wrap">
                  <Button onClick={setHindiSampleText} variant="outline" size="sm">
                    🇮🇳 Hindi Sample
                  </Button>
                  <Button
                    onClick={() =>
                      setText(
                        "Once upon a time, in a quiet village, there lived a curious child who dreamed of the stars...",
                      )
                    }
                    variant="outline"
                    size="sm"
                  >
                    🇺🇸 English Sample
                  </Button>
                </div>

                <div className="flex items-center gap-2">
                  {!isPlaying ? (
                    <Button onClick={speak} className="flex items-center gap-2">
                      <Play className="h-4 w-4" />
                      Speak
                    </Button>
                  ) : (
                    <>
                      {!isPaused ? (
                        <Button onClick={pause} variant="outline" className="flex items-center gap-2 bg-transparent">
                          <Pause className="h-4 w-4" />
                          Pause
                        </Button>
                      ) : (
                        <Button onClick={resume} className="flex items-center gap-2">
                          <Play className="h-4 w-4" />
                          Resume
                        </Button>
                      )}
                      <Button onClick={stop} variant="destructive" className="flex items-center gap-2">
                        <Square className="h-4 w-4" />
                        Stop
                      </Button>
                    </>
                  )}
                </div>

                {isPlaying && (
                  <div className="text-sm text-blue-600 dark:text-blue-400">
                    {isPaused ? "⏸️ Paused" : "🔊 Speaking..."}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Voice Settings */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Voice Settings
                </CardTitle>
                <CardDescription>Customize the voice output</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    Language
                  </Label>
                  <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      {languageOptions.map((lang) => (
                        <SelectItem key={lang.code} value={lang.code}>
                          {lang.flag} {lang.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedLanguage === "hi" && !hasHindiVoices() && (
                    <p className="text-xs text-amber-600 dark:text-amber-400">
                      No Hindi voices found. Install Hindi language support in your system.
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Voice</Label>
                  <Select value={selectedVoice} onValueChange={setSelectedVoice}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a voice" />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredVoices.map((voice) => (
                        <SelectItem key={voice.name} value={voice.name}>
                          {voice.name} ({voice.lang})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Showing {filteredVoices.length} voice(s) for{" "}
                    {selectedLanguage === "all"
                      ? "all languages"
                      : languageOptions.find((l) => l.code === selectedLanguage)?.name}
                  </p>
                </div>

                <Separator />

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <Label>Speed</Label>
                    <span className="text-sm text-muted-foreground">
                      {getSpeedLabel(speed[0])} ({speed[0].toFixed(1)}x)
                    </span>
                  </div>
                  <Slider value={speed} onValueChange={setSpeed} min={0.5} max={2} step={0.1} className="w-full" />
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <Label>Pitch</Label>
                    <span className="text-sm text-muted-foreground">
                      {getPitchLabel(pitch[0])} ({pitch[0].toFixed(1)})
                    </span>
                  </div>
                  <Slider value={pitch} onValueChange={setPitch} min={0.5} max={2} step={0.1} className="w-full" />
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <Label>Volume</Label>
                    <span className="text-sm text-muted-foreground">
                      {getVolumeLabel(volume[0])} ({Math.round(volume[0] * 100)}%)
                    </span>
                  </div>
                  <Slider value={volume} onValueChange={setVolume} min={0} max={1} step={0.1} className="w-full" />
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label>Emotion/Tone</Label>
                  <Select value={emotion} onValueChange={setEmotion}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="neutral">Neutral</SelectItem>
                      <SelectItem value="happy">Happy</SelectItem>
                      <SelectItem value="sad">Sad</SelectItem>
                      <SelectItem value="excited">Excited</SelectItem>
                      <SelectItem value="calm">Calm</SelectItem>
                      <SelectItem value="serious">Serious</SelectItem>
                      <SelectItem value="angry">Angry</SelectItem>
                      <SelectItem value="motivational">Motivational</SelectItem>
                      <SelectItem value="storytelling">Storytelling</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">Emotion affects pitch and speed automatically</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Quick Presets */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Presets</CardTitle>
            <CardDescription>Apply common voice settings instantly</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setSpeed([0.8])
                  setPitch([0.9])
                  setVolume([0.7])
                  setEmotion("storytelling")
                }}
              >
                📚 Storytelling
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setSpeed([1.1])
                  setPitch([1.1])
                  setVolume([0.9])
                  setEmotion("motivational")
                }}
              >
                💪 Motivational
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setSpeed([0.9])
                  setPitch([0.8])
                  setVolume([0.6])
                  setEmotion("calm")
                }}
              >
                🧘 Meditation
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedLanguage("hi")
                  setHindiSampleText()
                  setSpeed([0.8])
                  setPitch([1.0])
                  setVolume([0.8])
                  setEmotion("storytelling")
                }}
              >
                🇮🇳 Hindi
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
