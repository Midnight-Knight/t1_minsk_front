import {ReactNode} from "react";
import Style from "./divColumn.module.scss";

interface Props {
    children: ReactNode
}

export default function DivColumn({children}:Props) {
    return (
        <div className={Style.DivColumn}>
            {children}
        </div>
    )
}