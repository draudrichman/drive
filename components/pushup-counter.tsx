"use client"

import { useState, useEffect } from "react"
import { Settings, Plus, Volume2, VolumeX, BicepsFlexed } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function PushupTracker() {
    const [currentPushups, setCurrentPushups] = useState(0)
    const [targetPushups, setTargetPushups] = useState(100) // Default 50 pushups
    const [isSettingsOpen, setIsSettingsOpen] = useState(false)
    const [tempTarget, setTempTarget] = useState("100")
    const [isAnimating, setIsAnimating] = useState(false)
    const [soundEnabled, setSoundEnabled] = useState(true)

    // Load data from localStorage on component mount
    useEffect(() => {
        // Only run on client side
        if (typeof window === 'undefined') return;

        const savedPushups = localStorage.getItem("pushupTrackerPushups")
        const savedTarget = localStorage.getItem("pushupTrackerTarget")
        const savedSoundEnabled = localStorage.getItem("pushupTrackerSoundEnabled")

        if (savedPushups) {
            setCurrentPushups(Number.parseInt(savedPushups))
        }

        if (savedTarget) {
            setTargetPushups(Number.parseInt(savedTarget))
            setTempTarget(savedTarget)
        }

        if (savedSoundEnabled !== null) {
            setSoundEnabled(savedSoundEnabled === "true")
        }
    }, [])

    // Save to localStorage whenever pushups change
    useEffect(() => {
        if (typeof window === 'undefined') return;
        localStorage.setItem("pushupTrackerPushups", currentPushups.toString())
    }, [currentPushups])

    // Save sound preference
    useEffect(() => {
        if (typeof window === 'undefined') return;
        localStorage.setItem("pushupTrackerSoundEnabled", soundEnabled.toString())
    }, [soundEnabled])

    const resetData = () => {
        setCurrentPushups(0)
        localStorage.setItem("pushupTrackerPushups", "0")
    }

    // Sound functions
    const playSound = (type: "add" | "block" | "goal") => {
        if (!soundEnabled) return

        // Create audio context for Web Audio API
        const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()

        const createBeep = (frequency: number, duration: number, volume = 0.1) => {
            const oscillator = audioContext.createOscillator()
            const gainNode = audioContext.createGain()

            oscillator.connect(gainNode)
            gainNode.connect(audioContext.destination)

            oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime)
            oscillator.type = "sine"

            gainNode.gain.setValueAtTime(0, audioContext.currentTime)
            gainNode.gain.linearRampToValueAtTime(volume, audioContext.currentTime + 0.01)
            gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration)

            oscillator.start(audioContext.currentTime)
            oscillator.stop(audioContext.currentTime + duration)
        }

        switch (type) {
            case "add":
                // Quick positive beep for adding pushups
                createBeep(800, 0.1, 0.05)
                break
            case "block":
                // Double beep for completing a block
                createBeep(600, 0.15, 0.08)
                setTimeout(() => createBeep(800, 0.15, 0.08), 100)
                break
            case "goal":
                // Victory fanfare for completing goal
                const notes = [523, 659, 784, 1047] // C, E, G, C (major chord)
                notes.forEach((note, index) => {
                    setTimeout(() => createBeep(note, 0.3, 0.1), index * 150)
                })
                break
        }
    }

    const addPushups = (amount: number) => {
        const previousPushups = currentPushups
        const newPushups = Math.min(currentPushups + amount, targetPushups)
        const previousBlocks = Math.floor(previousPushups / 10)
        const newBlocks = Math.floor(newPushups / 10)
        const wasGoalReached = previousPushups >= targetPushups
        const isGoalReached = newPushups >= targetPushups

        setIsAnimating(true)
        setCurrentPushups(newPushups)

        // Play appropriate sound
        if (!wasGoalReached && isGoalReached) {
            // Goal completed
            setTimeout(() => playSound("goal"), 200)
        } else if (newBlocks > previousBlocks) {
            // Block completed
            setTimeout(() => playSound("block"), 200)
        } else {
            // Regular addition
            setTimeout(() => playSound("add"), 100)
        }

        setTimeout(() => setIsAnimating(false), 600)
    }

    const saveTarget = () => {
        const newTarget = Number.parseInt(tempTarget)
        setTargetPushups(newTarget)
        localStorage.setItem("pushupTrackerTarget", newTarget.toString())
        setIsSettingsOpen(false)
    }

    const toggleSound = () => {
        setSoundEnabled(!soundEnabled)
        // Play a test sound when enabling
        if (!soundEnabled) {
            setTimeout(() => playSound("add"), 100)
        }
    }

    const progressPercentage = Math.min((currentPushups / targetPushups) * 100, 100)
    const isGoalReached = currentPushups >= targetPushups

    // Calculate number of blocks (each block = 10 pushups)
    const totalBlocks = Math.ceil(targetPushups / 10)
    const completedBlocks = Math.floor(currentPushups / 10)
    const currentBlockProgress = (currentPushups % 10) / 10 // Progress in current block (0-1)

    // SVG parameters
    const radius = 60
    const circumference = 2 * Math.PI * radius
    const strokeWidth = 12
    const center = 100

    // Generate segments for the circular progress bar
    const generateSegments = () => {
        const segments: { path: string; fill: string; stroke: string; number: number; textX: number; textY: number; isComplete: boolean; isPartial: boolean }[] = [];

        // If there are no blocks, return empty array
        if (totalBlocks === 0) return segments

        const anglePerSegment = 360 / totalBlocks

        for (let i = 0; i < totalBlocks; i++) {
            const startAngle = i * anglePerSegment - 90 // Start at top (-90 degrees)
            const endAngle = (i + 1) * anglePerSegment - 90

            // Calculate if this segment is complete, partial, or empty
            const isComplete = i < completedBlocks
            const isPartial = i === completedBlocks && currentBlockProgress > 0

            // Calculate arc path
            const startRad = (startAngle * Math.PI) / 180
            const endRad = isPartial
                ? ((startAngle + anglePerSegment * currentBlockProgress) * Math.PI) / 180
                : (endAngle * Math.PI) / 180

            const x1 = center + radius * Math.cos(startRad)
            const y1 = center + radius * Math.sin(startRad)
            const x2 = center + radius * Math.cos(endRad)
            const y2 = center + radius * Math.sin(endRad)

            // Determine if we need to use the large arc flag
            const largeArcFlag = endRad - startRad > Math.PI ? 1 : 0

            // Create the arc path
            const path = `M ${center} ${center} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`

            segments.push({
                path,
                fill: isComplete || isPartial ? "#22c55e" : "#f3f4f6",
                stroke: "#d1d5db",
                number: (i + 1) * 10 > targetPushups ? targetPushups : (i + 1) * 10,
                textX: center + radius * 0.7 * Math.cos(((startAngle + anglePerSegment / 2) * Math.PI) / 180),
                textY: center + radius * 0.7 * Math.sin(((startAngle + anglePerSegment / 2) * Math.PI) / 180),
                isComplete,
                isPartial,
            })
        }

        return segments
    }

    const segments = generateSegments()

    return (
        <Card className="w-full max-w-md mx-auto bg-gradient-to-br from-green-50 to-emerald-50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-2xl font-bold text-green-900 flex items-center gap-2">
                    <BicepsFlexed className="h-6 w-6 text-green-600" />
                    Daily Pushups
                </CardTitle>
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={toggleSound}
                        className={`${soundEnabled ? "text-green-600 hover:bg-green-100" : "text-gray-400 hover:bg-gray-100"}`}
                        title={soundEnabled ? "Sound On" : "Sound Off"}
                    >
                        {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={resetData}
                        className="text-green-600 hover:bg-green-100"
                        title="Reset Progress"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                            <path d="M3 3v5h5" />
                        </svg>
                    </Button>
                    <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
                        <DialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-green-600 hover:bg-green-100">
                                <Settings className="h-4 w-4" />
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Set Daily Target</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="target">Daily Target (Pushups)</Label>
                                    <Input
                                        id="target"
                                        type="number"
                                        min="1"
                                        max="500"
                                        value={tempTarget}
                                        onChange={(e) => setTempTarget(e.target.value)}
                                        className="mt-1"
                                    />
                                </div>
                                <Button onClick={saveTarget} className="w-full">
                                    Save Target
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </CardHeader>

            <CardContent className="space-y-6">
                {/* Progress Stats */}
                {/* <div className="text-center space-y-2">
                    <div className="text-3xl font-bold text-green-900">{currentPushups}</div>
                    <div className="text-sm text-green-600">of {targetPushups} pushups</div>
                    <div className="text-xs text-green-500">{progressPercentage.toFixed(0)}% complete</div>
                </div> */}

                {/* Circular Progress Bar */}
                <div className="flex justify-center">
                    <div className="relative">
                        <div
                            className={`transition-all duration-1000 ease-out ${isAnimating ? "animate-pulse scale-105" : ""}`}
                            style={{ width: "250px", height: "250px" }}
                        >
                            <svg
                                viewBox="0 0 200 200"
                                className="w-full h-full"
                                style={{ filter: `drop-shadow(0 4px 12px rgba(0,0,0,0.15))` }}
                            >
                                {/* Background Circle */}
                                <circle
                                    cx={center}
                                    cy={center}
                                    r={radius + strokeWidth / 2}
                                    fill="#ffffff"
                                    stroke="#e5e7eb"
                                    strokeWidth="1"
                                />

                                {/* Segments */}
                                {segments.map((segment, index) => (
                                    <g key={index}>
                                        <path
                                            d={segment.path}
                                            fill={segment.fill}
                                            stroke={segment.stroke}
                                            strokeWidth="1"
                                            className="transition-all duration-500"
                                        />
                                        {/* Segment Number */}
                                        <text
                                            x={segment.textX}
                                            y={segment.textY}
                                            textAnchor="middle"
                                            dominantBaseline="middle"
                                            fontSize="10"
                                            fontWeight="bold"
                                            fill={segment.isComplete || segment.isPartial ? "#ffffff" : "#9ca3af"}
                                            className="transition-all duration-500"
                                        >
                                            {segment.number}
                                        </text>
                                    </g>
                                ))}

                                {/* Inner Circle */}
                                <circle
                                    cx={center}
                                    cy={center}
                                    r={radius - strokeWidth}
                                    fill="#ffffff"
                                    stroke="#e5e7eb"
                                    strokeWidth="1"
                                />

                                {/* Center Text */}
                                <text x={center} y={center - 15} textAnchor="middle" fontSize="24" fontWeight="bold" fill="#22c55e">
                                    {currentPushups}
                                </text>
                                <text x={center} y={center + 15} textAnchor="middle" fontSize="10" fill="#9ca3af">
                                    of {targetPushups}
                                </text>
                                <text x={center} y={center + 30} textAnchor="middle" fontSize="10" fill="#9ca3af">
                                    {progressPercentage.toFixed(0)}% complete
                                </text>
                            </svg>
                        </div>

                        {/* Goal Reached Celebration */}
                        {isGoalReached && (
                            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-green-500 animate-bounce text-2xl">
                                🏆
                            </div>
                        )}
                    </div>
                </div>

                {/* Add Pushups Buttons */}
                <div className="space-y-3">
                    <Button
                        onClick={() => addPushups(10)}
                        className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded-xl transition-all duration-200 transform hover:scale-105 active:scale-95"
                        disabled={currentPushups >= targetPushups}
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        10
                    </Button>

                </div>

                {/* Goal Status */}
                {isGoalReached ? (
                    <div className="text-center p-3 bg-green-100 rounded-lg border border-green-300">
                        <div className="text-green-800 font-semibold">🏆 Beast Mode Activated!</div>
                        <div className="text-green-600 text-sm">You crushed your pushup goal!</div>
                    </div>
                ) : (
                    <div className="text-center p-3 bg-green-100 rounded-lg border border-green-300">
                        <div className="text-green-800 font-semibold">Keep Pushing!</div>
                        <div className="text-green-600 text-sm">
                            {targetPushups - currentPushups} pushups left to reach your goal
                        </div>
                    </div>
                )}

            </CardContent>
        </Card>
    )
}
