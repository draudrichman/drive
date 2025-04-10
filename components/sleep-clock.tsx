import React, { useEffect, useRef } from "react";

interface SleepClockProps {
    startTime: string;
    setStartTime: (time: string) => void;
    endTime: string;
    setEndTime: (time: string) => void;
    sleepHours: number | null;
    onSave: () => void;
}

const SleepClock: React.FC<SleepClockProps> = ({ startTime, endTime, sleepHours }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = Math.min(centerX, centerY) - 30;

        // Draw the clock face (white circle with light gray border)
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        ctx.fillStyle = "#ffffff";
        ctx.fill();
        ctx.strokeStyle = "#f1f1f1";
        ctx.lineWidth = 2;
        ctx.stroke();

        // Draw 24-hour markers
        ctx.fillStyle = "#333333";
        ctx.font = "bold 16px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        // Draw the main hour markers (0, 6, 12, 18)
        const mainHours = [0, 6, 12, 18];
        mainHours.forEach(hour => {
            // For 24-hour clock, 0 is at the top, and we move clockwise
            const angle = (hour / 24) * Math.PI * 2 - Math.PI / 2;
            const x = centerX + radius * 0.85 * Math.cos(angle);
            const y = centerY + radius * 0.85 * Math.sin(angle);
            ctx.fillStyle = "#555555";
            ctx.font = "bold 16px sans-serif";
            ctx.fillText(hour.toString(), x, y);
        });

        // Draw small ticks for other hours
        for (let hour = 0; hour < 24; hour++) {
            if (!mainHours.includes(hour)) {
                const angle = (hour / 24) * Math.PI * 2 - Math.PI / 2;
                const x = centerX + radius * 0.85 * Math.cos(angle);
                const y = centerY + radius * 0.85 * Math.sin(angle);

                // Small dot for non-main hours
                ctx.beginPath();
                ctx.arc(x, y, 2, 0, 2 * Math.PI);
                ctx.fillStyle = "#999999";
                ctx.fill();
            }
        }

        // Parse times to angles
        const parseTimeToAngle = (timeStr: string): number => {
            if (!timeStr || !timeStr.includes(":")) return 0;
            const [hoursStr, minutesStr] = timeStr.split(":");
            const hours = parseInt(hoursStr, 10);
            const minutes = parseInt(minutesStr, 10);
            if (isNaN(hours) || isNaN(minutes)) return 0;
            const totalHours = hours + minutes / 60;
            return (totalHours / 24) * Math.PI * 2 - Math.PI / 2;
        };

        const startAngle = parseTimeToAngle(startTime);
        const endAngle = parseTimeToAngle(endTime);

        if (startTime && endTime) {
            // Draw the sleep arc (thick blue line)
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius + 15, startAngle, endAngle);
            ctx.strokeStyle = "oklch(0.645 0.246 16.439)";
            ctx.lineWidth = 15;
            ctx.lineCap = "round";
            ctx.stroke();
        }

        // Draw the hours in the center
        if (sleepHours !== null) {
            const hours = Math.floor(sleepHours);
            const minutes = Math.round((sleepHours - hours) * 60);

            ctx.fillStyle = "#333333";
            ctx.font = "bold 36px sans-serif";
            ctx.textAlign = "center";
            ctx.fillText(`${hours}`, centerX, centerY - 10);

            ctx.fillStyle = "#555555";
            ctx.font = "bold 16px sans-serif";
            ctx.fillText(`h`, centerX + 25, centerY - 10);

            if (minutes > 0) {
                ctx.fillStyle = "#555555";
                ctx.font = "regular 14px sans-serif";
                ctx.fillText(`${minutes} min`, centerX, centerY + 15);
            }
        }

    }, [startTime, endTime, sleepHours]);

    return (
        <div className="relative mx-auto" style={{ width: "300px", height: "300px" }}>
            <canvas ref={canvasRef} width={300} height={300} className="mx-auto" />
        </div>
    );
};

export default SleepClock;