import type { SVGAttributes } from 'react';

export default function AppLogoIcon(props: SVGAttributes<SVGElement>) {
    return (
        <svg
            {...props}
            viewBox="0 0 40 40"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <rect
                x="8"
                y="7"
                width="24"
                height="27"
                rx="5"
                stroke="currentColor"
                strokeWidth="3"
            />
            <path
                d="M15 7.5V6.5C15 4.57 16.57 3 18.5 3h3C23.43 3 25 4.57 25 6.5v1"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
            />
            <path
                d="m14 21 4 4 8-9"
                stroke="currentColor"
                strokeWidth="3.2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}
