'use client';
import Style from "./history.module.scss";
import {useEffect, useState} from "react";

export default function Page() {
    const [data, setData] = useState<{category: string, subCategory: string, question: string, answer: string, message: string, priority: string, audience: string}[]>([]);

    useEffect(() => {
        (async () => {
            const response = await fetch(process.env.NEXT_PUBLIC_API+ "/api/user/history");
            const buffer = await response.json();
            setData(buffer.messages);
            //setData([{category: 'Продукт - Кредиты', subCategory: 'Потребительские - Старт', question: 'Как оформить кредит На всё про всё?', answer: 'Для оформления кредита \'На всё про всё\' обратитесь в любое отделение банка с паспортом. Кредит выдается на любые цели до 70 000 BYN на срок до 7 лет.', message: 'здравствуйте! я хочу на все про все', priority: 'высокий', audience: 'новые клиенты'}, {category: 'Продукт - Кредиты', subCategory: 'Потребительские - Старт', question: 'Как оформить кредит На всё про всё?', answer: 'Для оформления кредита \'На всё про всё\' обратитесь в любое отделение банка с паспортом. Кредит выдается на любые цели до 70 000 BYN на срок до 7 лет.', message: 'здравствуйте! я хочу на все про все', priority: 'высокий', audience: 'новые клиенты'},{category: 'Продукт - Кредиты', subCategory: 'Потребительские - Старт', question: 'Как оформить кредит На всё про всё?', answer: 'Для оформления кредита \'На всё про всё\' обратитесь в любое отделение банка с паспортом. Кредит выдается на любые цели до 70 000 BYN на срок до 7 лет.', message: 'здравствуйте! я хочу на все про все', priority: 'высокий', audience: 'новые клиенты'}, {category: 'Продукт - Кредиты', subCategory: 'Потребительские - Старт', question: 'Как оформить кредит На всё про всё?', answer: 'Для оформления кредита \'На всё про всё\' обратитесь в любое отделение банка с паспортом. Кредит выдается на любые цели до 70 000 BYN на срок до 7 лет.', message: 'здравствуйте! я хочу на все про все', priority: 'высокий', audience: 'новые клиенты'}, {category: 'Продукт - Кредиты', subCategory: 'Потребительские - Старт', question: 'Как оформить кредит На всё про всё?', answer: 'Для оформления кредита \'На всё про всё\' обратитесь в любое отделение банка с паспортом. Кредит выдается на любые цели до 70 000 BYN на срок до 7 лет.', message: 'здравствуйте! я хочу на все про все', priority: 'высокий', audience: 'новые клиенты'}, {category: 'Продукт - Кредиты', subCategory: 'Потребительские - Старт', question: 'Как оформить кредит На всё про всё?', answer: 'Для оформления кредита \'На всё про всё\' обратитесь в любое отделение банка с паспортом. Кредит выдается на любые цели до 70 000 BYN на срок до 7 лет.', message: 'здравствуйте! я хочу на все про все', priority: 'высокий', audience: 'новые клиенты'}]);
        })()
    }, []);

    return (
        <div className={Style.Page}>
            {data.map((item, index) => (
                <div className={Style.Card} key={index}>
                    <div>
                        <p className={Style.Heading}><strong>Оригинальный вопрос: </strong>{item.message}</p>
                        <p className={Style.Heading}><strong>Основная категория: </strong>{item.category}</p>
                        <p className={Style.Heading}><strong>Подкатегория: </strong>{item.subCategory}</p>
                        <p className={Style.Heading}><strong>Вопрос обработанный:</strong>{item.question}</p>
                    </div>
                    <div>
                        <p className={Style.Text}><strong>Приоритет: </strong>{item.priority}</p>
                        <p className={Style.Text}><strong>Целевая аудитория: </strong>{item.audience}</p>
                        <p className={Style.Text}><strong>Ответ: </strong>{item.answer}</p>
                    </div>
                </div>
            ))}
        </div>
    )
}