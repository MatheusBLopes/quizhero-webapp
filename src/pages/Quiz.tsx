import React, { useState, useEffect, FormEvent } from 'react'
import { useParams } from 'react-router-dom'

import CSS from 'csstype';



import api from '../services/api'

import '../styles/quiz.css'

type Answer = {
    id?: number;
    description: string | undefined;
    true_or_false: boolean | undefined;
}

type NewAnswer = {
    id: number;
    description?: string;
    true_or_false?: boolean;
}

type Question = {
    id: string;
    description: string;
    answers: [Answer]
    answered?: boolean | undefined
}

type Quiz = {
    id: string;
    title: string;
    questions: [Question]
}

export function Quiz() {
    const [quiz, setQuiz] = useState<Quiz>()
    const [questions, setQuestions] = useState<Question[]>([])
    const [newAnswerList, setNewAnswerList] = useState<NewAnswer[]>([])
    const [newQuestion, setNewQestion] = useState('')
    const { id } = useParams<{id: string}>()

    useEffect(() => {
        api.get(`quiz/${id}/`).then(response => {
            setQuiz(response.data)
            setQuestions(response.data.questions)
        })
      }, [id])

    function handleDeleteQuestion(questionId: string) {
        if (window.confirm('Tem certeza que deseja excluir essa pergunta?')) {
            api.delete(`questions/${questionId}/`)
            setQuestions(questions.filter(question => (question.id !== questionId)))
        }
    }

    function handleCreateNewAnswer() {
        let newAnswer: NewAnswer = {id: 0}
        if (newAnswerList.length === 0) {
            newAnswer.id = 1
        } else if ((newAnswerList.length > 0)) {
            let lastId = newAnswerList[newAnswerList.length - 1].id
            newAnswer.id = lastId + 1
        }

        newAnswer.description = ""
        newAnswer.true_or_false = false

        setNewAnswerList([...newAnswerList, newAnswer])
    }

    function handleRemoveNewAnswer(id: number) {
        setNewAnswerList(newAnswerList.filter(newAnswer => (newAnswer.id !== id)))
    }

    async function handleNewQuestion(e: FormEvent) {
        e.preventDefault()
        const answers: any= []
        newAnswerList.forEach((answer) => {
            let answerWithoutId: Answer = {description: "", true_or_false: false}
            answerWithoutId.description = answer.description
            answerWithoutId.true_or_false = answer.true_or_false
            answers.push(answerWithoutId)
        })
        const question = {
            quiz: parseInt(id),
            description: newQuestion,
            answers: answers
        }

        await api.post('questions/', question)
        await api.get(`quiz/${id}/`).then(response => {
            setQuiz(response.data)
            setQuestions(response.data.questions)
        })
    }

    function handleUpdateAnswer(text: string | undefined, id: number, true_or_false: boolean | undefined) {
        let answerListUpdated = newAnswerList

        if (text) {
            newAnswerList.forEach((answer, index) => {
                if (answerListUpdated[index].id === id) {
                    answerListUpdated[index].description = text
                }
            })
        }

        if (true_or_false !== undefined) {
            newAnswerList.forEach((answer, index) => {
                if (answerListUpdated[index].id === id) {
                    answerListUpdated[index].true_or_false = true_or_false
                } else {
                    answerListUpdated[index].true_or_false = false
                }
            })
        }

        setNewAnswerList(answerListUpdated)
    }

    function handleAnswerQuestion(id: string) {
        let questionsList = questions
        questionsList.forEach((question) => {
            if (question.id === id) {
                question.answered = true
            }
        })

        setQuestions([...questionsList])
    }

    const rightQuestion: CSS.Properties = {
        background: 'green'
    }

    const wrongQuestion: CSS.Properties = {
        background: 'red'
    }

    const notAnsweredQuestion: CSS.Properties = {
        background: 'white'
    }

    return(
        <div className="quiz-container">
            <h1>{quiz?.title}</h1>

            {questions.map(question => (
                <table key={question.id} className="question-table">
                    <tbody>
                        <tr>
                            <td>
                                <button type="button" onClick={() => handleDeleteQuestion(question.id)}>Deletar questão</button>
                            </td>
                        </tr>
                        <tr>
                            <th>{question.description}</th>
                        </tr>
                        {question.answers.map(answer => (
                            <tr style={(question.answered === true ? answer.true_or_false === true ? rightQuestion:wrongQuestion :notAnsweredQuestion)} key={answer.id}>
                                <td>
                                    <input type="radio" value={answer.description} name={`question-${question.id}`}/>
                                    <span>{answer.description}</span>
                                </td>
                            </tr>
                        ))}
                        <tr>
                            <td>
                                <button type="button" onClick={() => handleAnswerQuestion(question.id)}>Responder</button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            ))}

            <div className="create-question-container">
                <h1>Criar nova pergunta</h1>
                <form onSubmit={handleNewQuestion}>
                    <textarea placeholder="Descrição da pergunta" className="new-question-description" onChange={event => setNewQestion(event.target.value)}>

                    </textarea>

                    {newAnswerList.map(newAnswer => (
                        <div key={newAnswer.id} className="new-answer-container">
                            <textarea placeholder="Nova resposta" onChange={event => handleUpdateAnswer(event.target.value, newAnswer.id, undefined)}></textarea>
                            <input type="radio" value={`answer-${newAnswer.id}`} name="new-question" onChange={event => handleUpdateAnswer(undefined, newAnswer.id, event.target.checked)}/>
                            <span>Resposta certa</span>
                            <button type="button" onClick={() => handleRemoveNewAnswer(newAnswer.id)}>Remover resposta</button>
                        </div>
                    ))}

                    <button type="button" onClick={() => handleCreateNewAnswer()}>Adicionar resposta</button>
                    <button type="submit" >Cadastrar pergunta</button>
                </form>

            </div>


        </div>
    )
}