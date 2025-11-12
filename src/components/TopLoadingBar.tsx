import { useEffect, useState } from "react";
import { useNavigation } from "react-router-dom";
import { Progress } from "@/components/ui/progress";

const TopLoadingBar = () => {
  const navigation = useNavigation();
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (navigation.state === "loading") {
      setIsVisible(true);
      setProgress(30);
      
      const timer1 = setTimeout(() => setProgress(60), 100);
      const timer2 = setTimeout(() => setProgress(80), 300);
      
      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
      };
    } else if (navigation.state === "idle" && isVisible) {
      setProgress(100);
      const timer = setTimeout(() => {
        setIsVisible(false);
        setProgress(0);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [navigation.state, isVisible]);

  if (!isVisible) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-1">
      <Progress value={progress} className="h-1 rounded-none" />
    </div>
  );
};

export default TopLoadingBar;
