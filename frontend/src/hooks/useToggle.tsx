import { useCallback, useState } from "react";

type StateType = boolean | null;

const useToggle = (initialState: StateType = false) => {
    const [state, setState] = useState<boolean>(
        initialState ? initialState : false
    );
    const [animate, setAnimate] = useState<boolean>(
        initialState ? initialState : false
    );

    const handleToggle = useCallback((): void => {
        setState((prev) => !prev);
    }, [setState]);

    const handleAnimation = useCallback((): void => {
        setAnimate((prev) => !prev);
    }, [setAnimate]);

    return { state, handleToggle, animate, handleAnimation };
};

export default useToggle;