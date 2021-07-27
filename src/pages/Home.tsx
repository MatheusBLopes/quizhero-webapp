import React, { useState, useEffect, FormEvent } from 'react'
import { Link } from 'react-router-dom'

import api from '../services/api'

import '../styles/home.css'

type Quiz = {
    id: string;
    title: string;
}

export function Home() {
    const [quizzes, setQuizzes] = useState<Quiz[]>([])
    const [newQuiz, setNewQuiz] = useState('')

    useEffect(() => {
        api.get('quiz/', {}).then(response => {
            setQuizzes(response.data.results)
        })
      }, [])

    function handleNewQuiz(e: FormEvent) {
        e.preventDefault()
        const quiz = {
            title: newQuiz,
            questions: []
        }
        api.post('quiz/', quiz)
    }

    function handleDeleteQuiz(quizId: string) {
        if (window.confirm('Tem certeza que deseja excluir esse questionário?')) {
            api.delete(`quiz/${quizId}/`)
            setQuizzes(quizzes.filter(quiz => (quiz.id !== quizId)))
        }
    }


    return(
        <div className="quizzes-container">
            <header>

            </header>
            <h1>Questionários</h1>
            <ul>
                {quizzes.map(quiz => (
                    <li key={quiz.id}>
                        <Link to={`/quiz/${quiz.id}`}>{quiz.title}</Link>
                        <button className="delete-quiz-button" type="button" onClick={() => handleDeleteQuiz(quiz.id)}>Deletar questionário</button>
                    </li>
                ))}
            </ul>

            <div className="new-quiz-container">
                <h1>Cadastrar Questionário</h1>
                <form onSubmit={handleNewQuiz}>
                    <textarea placeholder="Título do questionário" className="new-quiz-description" onChange={event => setNewQuiz(event.target.value)}/>
                    <button type="submit" >Cadastrar questionário</button>
                </form>

            </div>
        </div>
    )
}