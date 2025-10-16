'use client';
import Style from "./support.module.scss";
import ChatClient from "@/webComponents/ChatClient";
import Input from "@/components/input";
import {useEffect, useMemo, useRef, useState} from "react";
import Title from "@/components/title";
import Select from "@/components/select";
import TextArea from "@/components/textArea";
import Button from "@/components/button";
import { Switch } from '@base-ui-components/react/switch';

export default function PageChat() {
    try {
        const [isAI, setIsAI] = useState(false);
        const [savedAIText, setSavedAIText] = useState<string | null>(null);
        const [savedTemplateText, setSavedTemplateText] = useState<string | null>(null);
        const [textPriority, setTextPriority] = useState('');
        const [isActivePriority, setIsActivePriority] = useState(false);
        const [textAudience, setTextAudience] = useState('');
        const [isActiveAudience, setIsActiveAudience] = useState(false);
        const [text, setText] = useState('');
        const [isActive, setIsActive] = useState(false);
        const [accuracy, setAccuracy] = useState<null | number>(null);
        const [isActiveAccuracy, setIsActiveAccuracy] = useState(false);
        const [data, setData] = useState<{
            accuracy: number
            audience: string
            category: string
            subCategory: string
            priority: string
            question: string
            answer: string
            id: string
        }[] | null>(null);
        const [tree, setTree] = useState<{categories: {id: string, title: string, subCategories: {id: string, title: string, questions: {id: string, title: string, audience: string, priority: string}[]}[]}[]}>({categories: []});
        const [selectedFirstIndex, setSelectedFirstIndex] = useState<number | null>(null);
        const [selectedSecondIndex, setSelectedSecondIndex] = useState<number | null>(null);
        const [selectedThreeIndex, setSelectedThreeIndex] = useState<number | null>(null);
        const [status, setStatus] = useState<null | boolean>(null);
        const [send, setSend] = useState<null | boolean>(null);
        const isUserEditing = useRef(false);
        const [loading, setLoading] = useState(false);

        const callback = (data: {
            accuracy: number
            audience: string
            category: string
            subCategory: string
            priority: string
            question: string
            answer: string
            id: string
        }[]) => {
            (async () => {
                setData(data);
                const response = await fetch(process.env.NEXT_PUBLIC_API + "/api/chat/questions", {
                    method: 'GET'
                });
                setTree(await response.json());
            })()
        }

        const highlightedCategories = useMemo(() => {
            if (!data || !tree.categories.length) return [];
            const cats = data
                .map(d => (d.category ?? "").trim().toLowerCase())
                .filter(Boolean);
            return tree.categories
                .map((c, i) => cats.includes((c.title ?? "").trim().toLowerCase()) ? i : null)
                .filter((i): i is number => i !== null);
        }, [data, tree]);

        const highlightedSubCategories = useMemo(() => {
            if (!data || selectedFirstIndex === null) return [];
            const subcats = data
                .map(d => (d.subCategory ?? "").trim().toLowerCase())
                .filter(Boolean);
            const subs = tree.categories[selectedFirstIndex]?.subCategories ?? [];
            return subs
                .map((s, i) => subcats.includes((s.title ?? "").trim().toLowerCase()) ? i : null)
                .filter((i): i is number => i !== null);
        }, [data, tree, selectedFirstIndex]);

        const highlightedQuestions = useMemo(() => {
            if (!data || selectedFirstIndex === null || selectedSecondIndex === null) return [];
            const qs = data
                .map(d => (d.question ?? "").trim().toLowerCase())
                .filter(Boolean);
            const questions = tree.categories[selectedFirstIndex]?.subCategories?.[selectedSecondIndex]?.questions ?? [];
            return questions
                .map((q, i) => qs.includes((q.title ?? "").trim().toLowerCase()) ? i : null)
                .filter((i): i is number => i !== null);
        }, [data, tree, selectedFirstIndex, selectedSecondIndex]);

        useEffect(() => {
            if (!data || !data.length || !tree.categories.length) return;

            const first = data[0];

            const normalize = (str?: string) => (str ?? "").trim().toLowerCase();

            const categoryIndex = tree.categories.findIndex(
                (c) => normalize(c.title) === normalize(first.category)
            );

            if (categoryIndex === -1) return; // если категория не найдена
            setSelectedFirstIndex(categoryIndex);

            const subcategories = tree.categories[categoryIndex]?.subCategories ?? [];
            const subCategoryIndex = subcategories.findIndex(
                (s) => normalize(s.title) === normalize(first.subCategory)
            );
            if (subCategoryIndex === -1) return;
            setSelectedSecondIndex(subCategoryIndex);

            const questions = subcategories[subCategoryIndex]?.questions ?? [];
            const questionIndex = questions.findIndex(
                (q) => normalize(q.title) === normalize(first.question)
            );
            if (questionIndex === -1) return;
            setSelectedThreeIndex(questionIndex);

            setAccuracy(first.accuracy ?? null);
            setTextPriority(first.priority ?? "");
            setTextAudience(first.audience ?? "");
            setText(first.answer ?? "");

        }, [data, tree]);

        useEffect(() => {
            if (
                !tree.categories.length ||
                selectedFirstIndex === null ||
                selectedSecondIndex === null ||
                selectedThreeIndex === null
            ) {
                setAccuracy(null);
                setText('N/A');
                return;
            }

            const normalize = (str?: string) => (str ?? "").trim().toLowerCase();

            const selectedCategory = tree.categories[selectedFirstIndex]?.title;
            const selectedSubCategory =
                tree.categories[selectedFirstIndex]?.subCategories?.[selectedSecondIndex]?.title;
            const selectedQuestionObj =
                tree.categories[selectedFirstIndex]?.subCategories?.[selectedSecondIndex]?.questions?.[selectedThreeIndex];

            const selectedQuestion = selectedQuestionObj?.title;
            const questionId = selectedQuestionObj?.id; // 🔹 id для запроса

            if (!selectedCategory || !selectedSubCategory || !selectedQuestion || !questionId) {
                setAccuracy(null);
                setText('N/A');
                return;
            }

            if (data && data.length) {
                const match = data.find(
                    (d) =>
                        normalize(d.category) === normalize(selectedCategory) &&
                        normalize(d.subCategory) === normalize(selectedSubCategory) &&
                        normalize(d.question) === normalize(selectedQuestion)
                );

                if (match) {
                    setAccuracy(match.accuracy);
                } else {
                    setAccuracy(null);
                }
            } else {
                setAccuracy(null);
            }

            setText('Идёт загрузка...');

            (async () => {
                try {
                    const res = await fetch(
                        `${process.env.NEXT_PUBLIC_API}/api/chat/answer/${questionId}`,
                        { method: 'GET' }
                    );

                    if (!res.ok) throw new Error(`Ошибка загрузки ответа: ${res.status}`);
                    const json = await res.json();

                    if (json?.text) {
                        isUserEditing.current = false; // сбрасываем флаг — текст оригинальный
                        setStatus(false);
                        setText(json.text);
                    } else {
                        isUserEditing.current = false;
                        setStatus(false);
                        setText('Ответ не найден');
                    }
                } catch (err) {
                    console.error('Ошибка при получении ответа:', err);
                    setText('Ошибка при загрузке ответа');
                }
            })();
        }, [data, tree, selectedFirstIndex, selectedSecondIndex, selectedThreeIndex]);

        useEffect(() => {
            console.log('AI data:', data);
            console.log('Tree:', tree);
            console.log('highlighted categories:', highlightedCategories);
            console.log('highlighted subCategory:', highlightedSubCategories);
            console.log('highlighted question:', highlightedQuestions);
        }, [tree, data, highlightedCategories, highlightedSubCategories, highlightedQuestions]);

        useEffect(() => {
            if (isUserEditing.current) {
                setStatus(true);
            }
        }, [text]);

        const apiData = async () => {
            setSend(null);
            if (
                !data ||
                !data.length ||
                selectedFirstIndex === null ||
                selectedSecondIndex === null ||
                selectedThreeIndex === null
            ) {
                console.warn("Не выбраны все селекты или нет данных для отправки");
                setSend(false);
                return;
            }

            const normalize = (str?: string) => (str ?? "").trim().toLowerCase();

            const selectedCategoryObj = tree.categories[selectedFirstIndex];
            const selectedSubCategoryObj = selectedCategoryObj?.subCategories?.[selectedSecondIndex];
            const selectedQuestionObj = selectedSubCategoryObj?.questions?.[selectedThreeIndex];

            if (!selectedCategoryObj || !selectedSubCategoryObj || !selectedQuestionObj) {
                console.warn("Некорректная структура дерева для отправки");
                setSend(false);
                return;
            }

            const match = data.find(
                (d) =>
                    normalize(d.category) === normalize(selectedCategoryObj.title) &&
                    normalize(d.subCategory) === normalize(selectedSubCategoryObj.title) &&
                    normalize(d.question) === normalize(selectedQuestionObj.title)
            );

            const messageId = match?.id ?? null;
            const selectedCategoryId = selectedCategoryObj.id ?? null;
            const selectedSubCategory = selectedSubCategoryObj.id ?? null;

            const selectedQuestionId = status ? null : selectedQuestionObj.id ?? null;
            const editedAnswerText = status ? text : null;

            const body = {
                messageId,
                selectedCategoryId,
                selectedSubCategory,
                selectedQuestionId,
                editedAnswerText,
            };

            console.log("Отправляем данные:", body);

            try {
                setLoading(true);
                const response = await fetch(`${process.env.NEXT_PUBLIC_API}/api/chat/select`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json;charset=utf-8",
                    },
                    body: JSON.stringify(body),
                });

                console.log('ok');
                if (!response.ok) throw new Error(`Ошибка запроса: ${response.status}`);
                setSend(true);
            } catch (err) {
                console.error("Ошибка при отправке данных:", err);
                setSend(false);
            }
            finally {
                setLoading(false);
            }
        };

        useEffect(() => {
            if (
                !data ||
                !tree.categories.length ||
                selectedFirstIndex === null ||
                selectedSecondIndex === null ||
                selectedThreeIndex === null
            ) {
                setAccuracy(null);
                setText('N/A');
                return;
            }

            const selectedQuestionObj =
                tree.categories[selectedFirstIndex]?.subCategories?.[selectedSecondIndex]?.questions?.[selectedThreeIndex];
            const questionId = selectedQuestionObj?.id;

            if (!questionId) return;

            const body = {
                question: data[0].question,
                answer_example: data[0].answer,
            };

            if (isAI) {
                setText('Идёт загрузка...');
                (async () => {
                    try {
                        const res = await fetch(`${process.env.NEXT_PUBLIC_API}/api/chat/request_answer_completion`, {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json;charset=utf-8",
                            },
                            body: JSON.stringify(body),
                        });
                        const json = await res.json();
                        if (json?.completed_answer) {
                            setText(json.completed_answer);
                            setSavedAIText(json.completed_answer);
                            setStatus(false);
                        } else {
                            setText('Ответ не найден');
                        }
                    } catch {
                        setText('Ошибка при загрузке ответа');
                    }
                })();
            }
        }, [selectedFirstIndex, selectedSecondIndex, selectedThreeIndex, isAI]);

        return (
            <div className={Style.ChatPage}>
                <div className={Style.Body}>
                    <Title title={'Чат'} />
                    <ChatClient url={process.env.NEXT_PUBLIC_API + '/api/chat/newMessage'} disabled={data !== null} callback={callback} />
                </div>
                <div className={Style.Card}>
                    <Title title={'Панель оператора'} />
                    <Input disabled={data === null} label={'Процент уверенности (только для всех 3х селекторов с AI значениями)'} text={data === null ? 'N/A' : accuracy === null ? 'N/A' : (Number(accuracy.toFixed(0))) + "%"} setText={() => {}} isActive={isActiveAccuracy} setIsActive={setIsActiveAccuracy}/>
                    <Select
                        highlightedItems={highlightedCategories}
                        selectedIndex={selectedFirstIndex}
                        setSelectedIndex={setSelectedFirstIndex}
                        options={data === null ? ['N/A'] : tree.categories.map((el) => el.title)}
                        label={'Основная категория'}
                    />

                    <Select
                        highlightedItems={highlightedSubCategories}
                        selectedIndex={selectedSecondIndex}
                        setSelectedIndex={setSelectedSecondIndex}
                        options={
                            (data === null ||
                                selectedFirstIndex === null ||
                                !tree.categories[selectedFirstIndex] ||
                                !tree.categories[selectedFirstIndex].subCategories)
                                ? ['N/A']
                                : tree.categories[selectedFirstIndex].subCategories.map((el) => el.title)
                        }
                        label={'Подкатегория'}
                    />

                    <Select
                        highlightedItems={highlightedQuestions}
                        selectedIndex={selectedThreeIndex}
                        setSelectedIndex={setSelectedThreeIndex}
                        options={
                            (data === null ||
                                selectedFirstIndex === null ||
                                selectedSecondIndex === null ||
                                !tree.categories[selectedFirstIndex]?.subCategories?.[selectedSecondIndex]?.questions)
                                ? ['N/A']
                                : tree.categories[selectedFirstIndex].subCategories[selectedSecondIndex].questions.map((el) => el.title)
                        }
                        label={'Вопрос'}
                    />
                    <Input disabled={true} label={'Приоритет'} text={(data === null ||
                        selectedFirstIndex === null ||
                        !tree.categories[selectedFirstIndex] ||
                        !tree.categories[selectedFirstIndex].subCategories ||
                        selectedSecondIndex === null ||
                        !tree.categories[selectedFirstIndex] ||
                        !tree.categories[selectedFirstIndex].subCategories ||
                        !tree.categories[selectedFirstIndex].subCategories[selectedSecondIndex] ||
                        !tree.categories[selectedFirstIndex].subCategories[selectedSecondIndex].questions ||
                        selectedThreeIndex === null ||
                        !tree.categories[selectedFirstIndex] ||
                        !tree.categories[selectedFirstIndex].subCategories ||
                        !tree.categories[selectedFirstIndex].subCategories[selectedSecondIndex] ||
                        !tree.categories[selectedFirstIndex].subCategories[selectedSecondIndex].questions ||
                        !tree.categories[selectedFirstIndex].subCategories[selectedSecondIndex].questions[selectedThreeIndex] ||
                        !tree.categories[selectedFirstIndex].subCategories[selectedSecondIndex].questions[selectedThreeIndex].priority)
                        ? 'N/A'
                        : tree.categories[selectedFirstIndex].subCategories[selectedSecondIndex].questions[selectedThreeIndex].priority} setText={() => {}} isActive={isActivePriority} setIsActive={setIsActivePriority}/>
                    <Input disabled={true} label={'Целевая аудитория'} text={(data === null ||
                        selectedFirstIndex === null ||
                        !tree.categories[selectedFirstIndex] ||
                        !tree.categories[selectedFirstIndex].subCategories ||
                        selectedSecondIndex === null ||
                        !tree.categories[selectedFirstIndex] ||
                        !tree.categories[selectedFirstIndex].subCategories ||
                        !tree.categories[selectedFirstIndex].subCategories[selectedSecondIndex] ||
                        !tree.categories[selectedFirstIndex].subCategories[selectedSecondIndex].questions ||
                        selectedThreeIndex === null ||
                        !tree.categories[selectedFirstIndex] ||
                        !tree.categories[selectedFirstIndex].subCategories ||
                        !tree.categories[selectedFirstIndex].subCategories[selectedSecondIndex] ||
                        !tree.categories[selectedFirstIndex].subCategories[selectedSecondIndex].questions ||
                        !tree.categories[selectedFirstIndex].subCategories[selectedSecondIndex].questions[selectedThreeIndex] ||
                        !tree.categories[selectedFirstIndex].subCategories[selectedSecondIndex].questions[selectedThreeIndex].audience)
                        ? 'N/A'
                        : tree.categories[selectedFirstIndex].subCategories[selectedSecondIndex].questions[selectedThreeIndex].audience} setText={() => {}} isActive={isActiveAudience} setIsActive={setIsActiveAudience}/>
                    <div className={Style.DivHor2}>
                        <p>
                            Шаблонный ответ
                        </p>
                        <Switch.Root
                            checked={isAI}
                            disabled={true}
                            onCheckedChange={async (checked) => {
                                // Сохраняем текущий текст в соответствующее хранилище
                                if (isAI) {
                                    setSavedAIText(text);
                                } else {
                                    setSavedTemplateText(text);
                                }

                                setIsAI(checked);
                                setLoading(true);

                                if (checked) {
                                    // Включили AI-режим
                                    // Если ранее уже был AI-текст — восстанавливаем его без запроса
                                    if (savedAIText) {
                                        setText(savedAIText);
                                        setStatus(false);
                                        setLoading(false);
                                        return;
                                    }

                                    // Если нет сохранённого — делаем запрос к API за AI-ответом
                                    const selectedQuestionObj =
                                        tree.categories[selectedFirstIndex!]?.subCategories?.[selectedSecondIndex!]?.questions?.[selectedThreeIndex!];
                                    const questionId = selectedQuestionObj?.id;

                                    if (!questionId) {
                                        setText("Ошибка: нет ID вопроса");
                                        setLoading(false);
                                        return;
                                    }

                                    try {
                                        const res = await fetch(`${process.env.NEXT_PUBLIC_API}/api/chat/answer/${questionId}`, {
                                            method: "GET",
                                        });
                                        const json = await res.json();
                                        if (json?.text) {
                                            setSavedAIText(json.text);
                                            setText(json.text);
                                            setStatus(false);
                                        } else {
                                            setText("Ответ не найден");
                                        }
                                    } catch (err) {
                                        console.error("Ошибка загрузки AI-ответа:", err);
                                        setText("Ошибка при загрузке AI-ответа");
                                    } finally {
                                        setLoading(false);
                                    }
                                } else {
                                    // Вернулись к шаблонному ответу
                                    if (savedTemplateText) {
                                        setText(savedTemplateText);
                                        setStatus(savedTemplateText !== text ? true : false);
                                    } else {
                                        setText("Шаблонный ответ отсутствует");
                                    }
                                    setLoading(false);
                                }
                            }}

                            className={Style.Switch}
                        >
                            <Switch.Thumb className={Style.Thumb} />
                        </Switch.Root>
                        <p>
                            AI сгенерированный ответ
                        </p>
                    </div>
                    <TextArea disabled={data === null} label={'Ответ'} text={data === null ? 'N/A' : text} setText={(value) => {
                        setText(value);
                        isUserEditing.current = true;
                    }} isActive={isActive} setIsActive={setIsActive}/>
                    <div className={Style.DivHor}>
                        <Button text={'Отправить'} type={'normal'} onClick={apiData} disabled={loading}/>
                        <div className={Style.DivVer}>
                            <p>
                                {status === null ? '' : status ? '✏️ Ответ изменён оператором' : '✅ Оригинальный ответ (AI)'}
                            </p>
                            <p>
                                {status === null ? 'Ожидает данных' : send === null ? 'Ожидание отправки' : send ? '✅ Данные успешно отправлены' : 'Ошибка отправки данных'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
    catch (e) {
        return (<div className={Style.ChatPage}></div>)
    }
}