import classNames from "classnames";
import Style from "./button.module.scss";

interface Props {
    text: string;
    type: 'normal' | 'error';
    onClick: () => void;
    disabled: boolean;
}

const styleType: Record<string, string> = {
    "normal": Style.BlueButton,
    "error": Style.RedButton
}

export default function Button({text, type, onClick, disabled}:Props) {
    return (
        <button disabled={disabled} onClick={() => onClick()} className={classNames(
            Style.Button, styleType[type])}>
            {text}
        </button>
    )
}