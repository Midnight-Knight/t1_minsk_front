import Style from "./title.module.scss";
import classNames from "classnames";

interface Props {
    title: string;
    color?: 'white' | 'black';
}

export default function Title({title, color = 'black'}:Props) {
    return (
        <h3 className={classNames(Style.Title, color === 'white' && Style.White)}>{title}</h3>
    )
}