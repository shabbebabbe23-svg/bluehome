import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Progress } from "@/components/ui/progress";

const TopLoadingBar = () => {
  const location = useLocation();
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    setProgress(20);
    
    const timer1 = setTimeout(() => setProgress(50), 50);
    const timer2 = setTimeout(() => setProgress(80), 100);
    const timer3 = setTimeout(() => setProgress(100), 150);
    const timer4 = setTimeout(() => {
      setIsVisible(false);
      setProgress(0);
    }, 300);
    
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, [location.pathname]);

  if (!isVisible) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-1">
      <Progress value={progress} className="h-1 rounded-none" />
    </div>
  );
};

export default TopLoadingBar;
