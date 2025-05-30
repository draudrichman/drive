"use client"

import { useState, useEffect } from "react"
import { Droplets, Settings, Plus } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function WaterTracker() {
    const [currentIntake, setCurrentIntake] = useState(0)
    const [targetIntake, setTargetIntake] = useState(4000) // Default 2L in ml
    const [isSettingsOpen, setIsSettingsOpen] = useState(false)
    const [tempTarget, setTempTarget] = useState("4")
    const [isAnimating, setIsAnimating] = useState(false)

    // Load data from localStorage on component mount
    useEffect(() => {
        // Only run on client side
        if (typeof window === 'undefined') return;

        const savedIntake = localStorage.getItem("waterTrackerIntake")
        const savedTarget = localStorage.getItem("waterTrackerTarget")

        if (savedIntake) {
            setCurrentIntake(Number.parseInt(savedIntake))
        }

        if (savedTarget) {
            setTargetIntake(Number.parseInt(savedTarget))
            setTempTarget((Number.parseInt(savedTarget) / 1000).toString())
        }
    }, [])

    // Save to localStorage whenever intake changes
    useEffect(() => {
        if (typeof window === 'undefined') return;
        localStorage.setItem("waterTrackerIntake", currentIntake.toString())
    }, [currentIntake])

    const resetData = () => {
        setCurrentIntake(0)
        localStorage.setItem("waterTrackerIntake", "0")
    }

    const addWater = (amount: number) => {
        setIsAnimating(true)
        setCurrentIntake((prev) => Math.min(prev + amount, targetIntake))
        setTimeout(() => setIsAnimating(false), 500)
    }

    const saveTarget = () => {
        const newTarget = Number.parseFloat(tempTarget) * 1000 // Convert L to ml
        setTargetIntake(newTarget)
        localStorage.setItem("waterTrackerTarget", newTarget.toString())
        setIsSettingsOpen(false)
    }

    const waterPercentage = Math.min((currentIntake / targetIntake) * 100, 100)
    const isGoalReached = currentIntake >= targetIntake

    return (
        <Card className="w-full max-w-md mx-auto bg-gradient-to-br from-blue-50 to-cyan-50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-2xl font-bold text-blue-900 flex items-center gap-2">
                    <Droplets className="h-6 w-6 text-blue-600" />
                    Water Intake
                </CardTitle>
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={resetData}
                        className="text-blue-600 hover:bg-blue-100"
                        title="Reset Progress"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                            <path d="M3 3v5h5" />
                        </svg>
                    </Button>
                    <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
                        <DialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-blue-600 hover:bg-blue-100">
                                <Settings className="h-4 w-4" />
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Set Daily Target</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="target">Daily Target (Liters)</Label>
                                    <Input
                                        id="target"
                                        type="number"
                                        step="0.1"
                                        min="0.5"
                                        max="10"
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
                <div className="text-center space-y-2">
                    <div className="text-3xl font-bold text-blue-900">{currentIntake}ml</div>
                    <div className="text-sm text-blue-600">
                        of {targetIntake}ml ({(targetIntake / 1000).toFixed(1)}L)
                    </div>
                    <div className="text-xs text-blue-500">{waterPercentage.toFixed(0)}% complete</div>
                </div>

                {/* Water Jar Visualization */}
                <div className="flex justify-center">
                    <div className="relative">
                        {/* Jar Container */}
                        <div className="w-32 h-40 border-4 border-blue-300 rounded-b-3xl bg-transparent relative overflow-hidden">
                            {/* Water Fill */}
                            <div
                                className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-blue-400 to-blue-300 transition-all duration-1000 ease-out ${isAnimating ? "animate-pulse" : ""
                                    }`}
                                style={{
                                    height: `${waterPercentage}%`,
                                    background: isGoalReached
                                        ? "linear-gradient(to top, #10b981, #34d399)"
                                        : "linear-gradient(to top, #3b82f6, #60a5fa)",
                                }}
                            >
                                {/* Water Surface Animation */}
                                <div className="absolute top-0 left-0 right-0 h-2 bg-white bg-opacity-20 animate-pulse"></div>
                            </div>

                            {/* Jar Neck */}
                            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-8 h-6 border-4 border-blue-300 border-b-0 bg-blue-50 rounded-t-lg"></div>
                        </div>

                        {/* Goal Reached Celebration */}
                        {isGoalReached && (
                            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-green-500 animate-bounce">
                                🎉
                            </div>
                        )}
                    </div>
                </div>

                {/* Add Water Buttons */}
                <div className="space-y-3">
                    <Button
                        onClick={() => addWater(250)}
                        className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 rounded-xl transition-all duration-200 transform hover:scale-105 active:scale-95"
                        disabled={currentIntake >= targetIntake}
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        250ml
                    </Button>


                </div>

                {/* Goal Status */}
                {isGoalReached ? (
                    <div className="text-center p-3 bg-green-100 rounded-lg border border-green-300">
                        <div className="text-green-800 font-semibold">🎉 Goal Reached!</div>
                        <div className="text-green-600 text-sm">Great job staying hydrated!</div>
                    </div>
                ) : (
                    <div className="text-center p-3 bg-blue-100 rounded-lg border border-blue-300">
                        <div className="text-blue-800 font-semibold">Keep Going!</div>
                        <div className="text-blue-600 text-sm">{targetIntake - currentIntake}ml left to reach your goal</div>
                    </div>
                )}

                {/* Reset Info */}
                {/* <div className="text-center text-xs text-blue-400">Resets daily at midnight</div> */}
            </CardContent>
        </Card>
    )
}
