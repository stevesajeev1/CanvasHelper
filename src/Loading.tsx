import { useEffect } from 'react';
import "./stylesheets/shared.css";
import "./stylesheets/Loading.css";

function Loading({ size }: { size: number }) {
    useEffect(() => {
        const loader = document.querySelector('.loader') as HTMLElement;
        if (loader) {
            loader.style.setProperty('--size', `${size}px`);
        }
    });

    return (
        <span className="loader"></span>
    );
}

export default Loading;
