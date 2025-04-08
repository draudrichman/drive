import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { habitCategories, habitColors, habitIcons } from "@/lib/constants";

interface NewHabitModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreate: (habit: {
        id: number;
        name: string;
        category: string;
        icon: string;
        color: string;
    }) => void;
}

export function NewHabitModal({ isOpen, onClose, onCreate }: NewHabitModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [name, setName] = useState("");
    const [category, setCategory] = useState(habitCategories[0]);
    const [icon, setIcon] = useState(habitIcons[0].name);
    const [color, setColor] = useState(habitColors[0].value);

    const resetForm = () => {
        setName("");
        setCategory(habitCategories[0]);
        setIcon(habitIcons[0].name);
        setColor(habitColors[0].value);
    };

    const handleCreate = async () => {
        if (!name.trim()) return;
        
        setIsLoading(true);

        try {
            const response = await fetch('/api/habits', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name,
                    category,
                    icon,
                    color
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to create habit');
            }

            const data = await response.json();
            
            // Call the onCreate prop with the new habit data
            onCreate(data.habit);
            
            // Reset form and close modal
            resetForm();
            onClose();
        } catch (error) {
            console.error("Error creating habit:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => {
            if (!open) {
                onClose();
                resetForm();
            }
        }}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add new habit</DialogTitle>
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
                        onClick={handleCreate} 
                        disabled={isLoading || !name.trim()}
                    >
                        {isLoading ? "Adding..." : "Add habit"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}