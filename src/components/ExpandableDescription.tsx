import { useState } from "react";
import { Button } from "@/components/ui/button";

interface ExpandableDescriptionProps {
    description?: string;
    maxChars?: number;
}

export const ExpandableDescription = ({
    description,
    maxChars = 300
}: ExpandableDescriptionProps) => {
    const [isExpanded, setIsExpanded] = useState(false);

    if (!description) return null;

    const shouldTruncate = description.length > maxChars;
    const displayDescription = isExpanded || !shouldTruncate
        ? description
        : `${description.slice(0, maxChars)}...`;

    return (
        <div>
            <h2 className="text-xl font-bold mb-3">Beskrivning</h2>
            <p className="text-muted-foreground whitespace-pre-line leading-relaxed">
                {displayDescription}
            </p>
            {shouldTruncate && (
                <Button
                    variant="link"
                    className="p-0 h-auto mt-2 text-primary font-semibold hover:no-underline"
                    onClick={() => setIsExpanded(!isExpanded)}
                >
                    {isExpanded ? "Visa mindre" : "Läs mer"}
                </Button>
            )}
        </div>
    );
};
