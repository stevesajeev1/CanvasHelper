import { useEffect, useRef } from 'react';
import "./stylesheets/shared.css";
import "./stylesheets/Loading.css";

function Loading({ size }: { size: number }) {
    const loader = useRef<HTMLSpanElement>(null);
    useEffect(() => {
        if (loader.current !== null) {
            loader.current.style.setProperty('--size', `${size}px`);
        }
    });

    return (
        <span className="loader" ref={loader}></span>
    );
}

export default Loading;
