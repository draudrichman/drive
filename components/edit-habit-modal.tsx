"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { habitCategories, habitColors, habitIcons } from "@/lib/constants";

interface EditHabitModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUpdate: (habit: {
        id: number;
        name: string;
        category: string;
        icon: string;
        color: string;
        description?: string | null;
    }) => void;
    habit: {
        id: string;
        name: string;
        category: string;
        icon: string;
        color: string;
        description?: string | null;
    } | null;
}

export function EditHabitModal({ isOpen, onClose, onUpdate, habit }: EditHabitModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [name, setName] = useState("");
    const [category, setCategory] = useState(habitCategories[0]);
    const [icon, setIcon] = useState(habitIcons[0].name);
    const [color, setColor] = useState(habitColors[0].value);
    const [description, setDescription] = useState<string | null>("");

    // Prefill form with habit data when the modal opens
    useEffect(() => {
        if (habit) {
            setName(habit.name);
            setCategory(habit.category);
            setIcon(habit.icon);
            setColor(habit.color);
            setDescription(habit.description ?? "");
        }
    }, [habit]);

    const resetForm = () => {
        setName("");
        setCategory(habitCategories[0]);
        setIcon(habitIcons[0].name);
        setColor(habitColors[0].value);
        setDescription("");
    };

    const handleUpdate = async () => {
        if (!name.trim() || !habit) return;

        setIsLoading(true);

        try {
            const response = await fetch(`/api/habits/${habit.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name,
                    category,
                    icon,
                    color,
                    description,
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to update habit");
            }

            const data = await response.json();

            // Call the onUpdate prop with the updated habit data
            onUpdate(data.habit);

            // Reset form and close modal
            resetForm();
            onClose();
        } catch (error) {
            console.error("Error updating habit:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog
            open={isOpen}
            onOpenChange={(open) => {
                if (!open) {
                    onClose();
                    resetForm();
                }
            }}
        >
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit habit</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Habit Name</label>
                        <Input
                            placeholder="Habit name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Category</label>
                        <Select value={category} onValueChange={setCategory}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent className="w-full">
                                {habitCategories.map((cat) => (
                                    <SelectItem key={cat} value={cat}>
                                        {cat}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Icon</label>
                        <Select value={icon} onValueChange={setIcon}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select icon" />
                            </SelectTrigger>
                            <SelectContent className="w-full">
                                {habitIcons.map(({ name, icon: Icon }) => (
                                    <SelectItem key={name} value={name}>
                                        <div className="flex items-center gap-2">
                                            <Icon className="h-4 w-4" />
                                            {name}
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Description</label>
                        <Textarea
                            placeholder="Describe your habit (optional)"
                            value={description ?? ""}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={3}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Color</label>
                        <Select value={color} onValueChange={setColor}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select color" />
                            </SelectTrigger>
                            <SelectContent className="w-full">
                                {habitColors.map(({ name, value }) => (
                                    <SelectItem key={value} value={value}>
                                        <div className="flex items-center gap-2">
                                            <div
                                                className="h-4 w-4 rounded-full"
                                                style={{ backgroundColor: value }}
                                            />
                                            {name}
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <Button
                        className="w-full"
                        onClick={handleUpdate}
                        disabled={isLoading || !name.trim()}
                    >
                        {isLoading ? "Updating..." : "Update habit"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}