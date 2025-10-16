import classNames from "classnames";
import Style from "./input.module.scss";

interface Props {
    label: string;
    text: string;
    setText: (text: string) => void;
    isActive: boolean;
    setIsActive: (isActive: boolean) => void;
    disabled: boolean;
}

export default function Input({label ,text, setText, isActive, setIsActive, disabled}:Props) {
    return (
        <div className={Style.Input}>
            <label className={classNames(Style.Label, text.length > 0 || isActive ? Style.LabelUp : null)}>{label}</label>
            <input disabled={disabled} onFocus={() => setIsActive(true)}
                      onBlur={() => setIsActive(false)} value={text} onChange={(e) => setText(e.target.value)}/>
        </div>
    )
}