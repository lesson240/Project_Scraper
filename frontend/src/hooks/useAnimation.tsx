import { useState, useCallback } from "react";

const useAnimation = (initial = false) => {
    const [isAnimating, setIsAnimating] = useState(initial);
    const start = useCallback(() => setIsAnimating(true), []);
    const stop = useCallback(() => setIsAnimating(false), []);
    return { isAnimating, start, stop };
};

export default useAnimation;