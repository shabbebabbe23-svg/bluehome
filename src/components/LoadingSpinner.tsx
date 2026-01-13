import { Loader2 } from "lucide-react";

const LoadingSpinner = () => {
    return (
        <div className="flex items-center justify-center min-h-screen bg-background">
            <div className="flex flex-col items-center gap-4">
                <Loader2 className="w-12 h-12 text-primary animate-spin" />
                <p className="text-muted-foreground text-lg">Laddar...</p>
            </div>
        </div>
    );
};

export default LoadingSpinner;
