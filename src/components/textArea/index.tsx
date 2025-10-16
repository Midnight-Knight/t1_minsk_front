import Style from "./textArea.module.scss";
import classNames from "classnames";
interface Props {
    label: string;
    text: string;
    setText: (text: string) => void;
    isActive: boolean;
    setIsActive: (isActive: boolean) => void;
    disabled: boolean;
}

export default function TextArea({label, text, setText, isActive, setIsActive, disabled}: Props) {
    return (
        <div className={Style.Body}>
            <label className={classNames(Style.Label, text.length > 0 || isActive ? Style.LabelUp : '')}>{label}</label>
            <textarea disabled={disabled} onFocus={() => setIsActive(true)}
                      onBlur={() => setIsActive(false)} value={text} onChange={(e) => setText(e.target.value)}/>
        </div>
    )
}