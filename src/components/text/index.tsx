import Style from "./text.module.scss"

interface Props {
    text: string
}

export default function Text({text}: Props) {
    return (
        <p className={Style.Text}>{text}</p>
    )
}