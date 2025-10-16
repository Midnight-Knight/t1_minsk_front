'use client';
import Link from "next/link";
import Style from "./heading.module.scss";
import classNames from "classnames";
import {usePathname} from "next/navigation";
import {Suspense, useEffect, useState} from "react";

const headingStyle: Record<string, Record<string, string>> = {
    '/': {
        'false': Style.ColorWhiteAndBlueHover,
        'true': Style.ColorBase
    },
    '/support': {
        'false': Style.ColorBase,
        'true': Style.ColorBase
    },
    '/history': {
        'false': Style.ColorBase,
        'true': Style.ColorBase
    },
}

export default function Heading() {
    return (
        <Suspense fallback={null}>
            <SuspenseHeading/>
        </Suspense>
    )
}

function SuspenseHeading() {
    const pathname = usePathname();
    const [scrollPosition, setScrollPosition] = useState<number>(0);

    const handleScroll = () => {
        const position = window.scrollY;
        setScrollPosition(position);
    };

    useEffect(() => {
        const scrollHandler = () => handleScroll();

        window.addEventListener('scroll', scrollHandler);

        return () => {
            window.removeEventListener('scroll', scrollHandler);
        }
    }, []);

    return (
        <header className={classNames(
            Style.Heading,
            headingStyle[pathname]?.[scrollPosition === 0 ? 'false' : 'true'] ?? Style.ColorBase
        )}>
            <h1 className={classNames(Style.Logo)}>Smart Support <span>Поддержка нового поколения</span></h1>
            <nav className={classNames(Style.Nav)}>
                <Link href={'/'}>Главная страница</Link>
                <Link href={'/support'}>Панель поддержки</Link>
                <Link href={'/history'}>История</Link>
            </nav>
        </header>
    )
}