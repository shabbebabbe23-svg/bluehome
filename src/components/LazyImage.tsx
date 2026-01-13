import { useState, useEffect, useRef, ImgHTMLAttributes } from "react";

interface LazyImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> {
    src: string;
    alt: string;
    className?: string;
    placeholderClassName?: string;
    onLoad?: () => void;
}

const LazyImage = ({
    src,
    alt,
    className = "",
    placeholderClassName = "",
    onLoad,
    ...props
}: LazyImageProps) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [isInView, setIsInView] = useState(false);
    const imgRef = useRef<HTMLImageElement>(null);
    const observerRef = useRef<IntersectionObserver | null>(null);

    useEffect(() => {
        // Create Intersection Observer to detect when image enters viewport
        observerRef.current = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setIsInView(true);
                        // Once image is in view, we can disconnect the observer
                        if (observerRef.current && imgRef.current) {
                            observerRef.current.unobserve(imgRef.current);
                        }
                    }
                });
            },
            {
                rootMargin: "50px", // Start loading 50px before image enters viewport
                threshold: 0.01,
            }
        );

        if (imgRef.current) {
            observerRef.current.observe(imgRef.current);
        }

        return () => {
            if (observerRef.current) {
                observerRef.current.disconnect();
            }
        };
    }, []);

    const handleLoad = () => {
        setIsLoaded(true);
        onLoad?.();
    };

    return (
        <div className="relative overflow-hidden" ref={imgRef}>
            {/* Placeholder with blur effect */}
            {!isLoaded && (
                <div
                    className={`absolute inset-0 bg-muted animate-pulse ${placeholderClassName}`}
                    aria-hidden="true"
                />
            )}

            {/* Actual image - only load when in viewport */}
            {isInView && (
                <img
                    src={src}
                    alt={alt}
                    className={`transition-opacity duration-300 ${isLoaded ? "opacity-100" : "opacity-0"
                        } ${className}`}
                    onLoad={handleLoad}
                    loading="lazy"
                    {...props}
                />
            )}
        </div>
    );
};

export default LazyImage;
