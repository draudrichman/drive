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
        name: string;
        category: string;
        icon: string;
        color: string;
    }) => void;
}

export function NewHabitModal({ isOpen, onClose, onCreate }: NewHabitModalProps) {
    const [name, setName] = useState("");
    const [category, setCategory] = useState(habitCategories[0]); // Default to first category
    const [icon, setIcon] = useState(habitIcons[0].name); // Default to first icon
    const [color, setColor] = useState(habitColors[0].value); // Default to first color

    const handleCreate = () => {
        if (!name) return;
        onCreate({ name, category, icon, color });
        setName("");
        setCategory(habitCategories[0]);
        setIcon(habitIcons[0].name);
        setColor(habitColors[0].value);
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
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
                    <Button className="w-full" onClick={handleCreate}>
                        Add habit
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}