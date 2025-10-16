'use client';
import {
    useFloating,
    useClick,
    useDismiss,
    useRole,
    useListNavigation,
    useInteractions,
    FloatingFocusManager,
    useTypeahead,
    offset,
    flip,
    size,
    autoUpdate,
    FloatingPortal,
} from "@floating-ui/react";
import {Dispatch, SetStateAction, useEffect, useRef, useState} from "react";
import Style from "./select.module.scss";
import classNames from "classnames";

interface Props {
    label: string;
    options: string[];
    selectedIndex: number | null;
    setSelectedIndex: Dispatch<SetStateAction<number | null>>;
    highlightedItems?: number[]; // 🔹 массив индексов для подсветки
}

export default function Select({options, label, selectedIndex, setSelectedIndex, highlightedItems = []}: Props) {
    const [isOpen, setIsOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState<number | null>(null);

    const { refs, floatingStyles, context } = useFloating<HTMLElement>({
        placement: "bottom-start",
        open: isOpen,
        onOpenChange: setIsOpen,
        whileElementsMounted: autoUpdate,
        middleware: [
            offset(5),
            flip({ padding: 10 }),
            size({
                apply({ rects, elements, availableHeight }) {
                    Object.assign(elements.floating.style, {
                        maxHeight: `${availableHeight}px`,
                        minWidth: `${rects.reference.width}px`,
                    });
                },
                padding: 10,
            }),
        ],
    });

    const listRef = useRef<Array<HTMLElement | null>>([]);
    const listContentRef = useRef(options);
    const isTypingRef = useRef(false);

    const click = useClick(context, { event: "mousedown" });
    const dismiss = useDismiss(context);
    const role = useRole(context, { role: "listbox" });
    const listNav = useListNavigation(context, {
        listRef,
        activeIndex,
        selectedIndex,
        onNavigate: setActiveIndex,
        loop: true,
    });
    const typeahead = useTypeahead(context, {
        listRef: listContentRef,
        activeIndex,
        selectedIndex,
        onMatch: isOpen ? setActiveIndex : setSelectedIndex,
        onTypingChange(isTyping) {
            isTypingRef.current = isTyping;
        },
    });

    const { getReferenceProps, getFloatingProps, getItemProps } = useInteractions(
        [dismiss, role, listNav, typeahead, click]
    );

    const handleSelect = (index: number) => {
        setSelectedIndex(index);
        setIsOpen(false);
    };

    const selectedItemLabel =
        selectedIndex !== null ? options[selectedIndex] : undefined;

    useEffect(() => {
        handleSelect(0);
    }, []);

    return (
        <>
            <div className={Style.Body}>
                <label className={classNames(Style.Label)}>{label}</label>
                <div
                    tabIndex={0}
                    ref={refs.setReference}
                    aria-labelledby="select-label"
                    aria-autocomplete="none"
                    className={Style.Select}
                    {...getReferenceProps()}
                >
                    <span>{selectedItemLabel || "Выберите..."}</span>
                    <div>
                        {highlightedItems.some((el) => el === selectedIndex) && <span>AI</span>}
                        <span></span>
                        <svg
                            width="8"
                            height="12"
                            viewBox="0 0 8 12"
                            fill="none"
                            stroke="currentcolor"
                            strokeWidth="1.5"
                        >
                            <path d="M0.5 4.5L4 1.5L7.5 4.5" />
                            <path d="M0.5 7.5L4 10.5L7.5 7.5" />
                        </svg>
                    </div>
                </div>
            </div>
            {isOpen && (
                <FloatingPortal>
                    <FloatingFocusManager context={context} modal={false}>
                        <div
                            ref={refs.setFloating}
                            style={{
                                ...floatingStyles,
                                overflowY: "auto",
                                background: "var(--text-gray-mini)",
                                borderRadius: 8,
                                outline: 0,
                            }}
                            {...getFloatingProps()}
                        >
                            {options.map((value, i) => {
                                const isSelected = i === selectedIndex;
                                const isActive = i === activeIndex;
                                const isHighlighted = highlightedItems.includes(i);

                                // 🔹 приоритет цветов: выбранный > активный > выделенный > обычный
                                let background = "";
                                let color = "";
                                if (isSelected) {
                                    background = "var(--background-card-blue-dark)";
                                    color = "var(--text-white)";
                                } else if (isActive) {
                                    background = "var(--background-second)";
                                    color = "var(--text)";
                                } else if (isHighlighted) {
                                    background = "var(--background-blue)";
                                    color = "var(--text-white)";
                                }

                                const suffix = isSelected && isHighlighted ? '✓ AI' :
                                    isSelected && !isHighlighted ? "✓" :
                                        isHighlighted && !isSelected ? "AI" :
                                            "";

                                return (
                                    <div
                                        key={value}
                                        ref={(node) => {listRef.current[i] = node}}
                                        role="option"
                                        tabIndex={i === activeIndex ? 0 : -1}
                                        style={{
                                            position: "relative",
                                            padding: 10,
                                            cursor: "default",
                                            background,
                                            color,
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "center",
                                        }}
                                        {...getItemProps({
                                            onClick() {
                                                handleSelect(i);
                                            },
                                            onKeyDown(event) {
                                                if (["Enter", " "].includes(event.key)) {
                                                    event.preventDefault();
                                                    handleSelect(i);
                                                }
                                            },
                                        })}
                                    >
                                        <span>{value}</span>
                                        {suffix && <span>{suffix}</span>}
                                    </div>
                                );
                            })}
                        </div>
                    </FloatingFocusManager>
                </FloatingPortal>
            )}
        </>
    );
}
