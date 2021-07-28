import React, { useState, useEffect, FormEvent } from 'react'
import { Link } from 'react-router-dom'

import api from '../services/api'

import '../styles/home.css'

type Quiz = {
    id: string;
    title: string;
    category: string;
}

type Category = {
    id: string;
    title: string;
}

export function Home() {
    const [quizzes, setQuizzes] = useState<Quiz[]>([])
    const [categories, setCategories] = useState<Category[]>([])
    const [category, setCategory] = useState('')
    const [newQuiz, setNewQuiz] = useState('')
    const [newCategory, setNewCategory] = useState('')

    useEffect(() => {
        api.get('quiz/', {}).then(response => {
            setQuizzes(response.data.results)
        })
      }, [newQuiz])

      useEffect(() => {
        api.get('category/', {}).then(response => {
            setCategories(response.data.results)
        })
      }, [newCategory])

    async function handleNewQuiz(e: FormEvent) {
        e.preventDefault()

        const quiz = {
            title: newQuiz,
            category: category,
            questions: []
        }
        await api.post('quiz/', quiz)
    }

    async function handleDeleteQuiz(quizId: string) {
        if (window.confirm('Tem certeza que deseja excluir esse questionário?')) {
            await api.delete(`quiz/${quizId}/`)
            setQuizzes(quizzes.filter(quiz => (quiz.id !== quizId)))
        }
    }

    async function handleNewCategory(e: FormEvent) {
        e.preventDefault()

        const data = {
            title: newCategory,
        }
        await api.post('category/', data)
    }


    return(
        <div className="quizzes-container">
            <header>

            </header>
            <div className="categories-container">
                <h1>Categorias</h1>
                <ul>
                    {categories.map(category => (
                        <ul key={category.id} className="category-box">
                            <div className="separator"></div>
                            <h2 className="category-title">{category.title}</h2>
                            {quizzes.map((quiz) => (
                                (quiz.category === category.id) ?
                                    <li key={quiz.id} className="link-box">
                                        <Link to={`/quiz/${quiz.id}`} className="quiz-link">{quiz.title}</Link>
                                        <button className="delete-quiz-button" type="button" onClick={() => handleDeleteQuiz(quiz.id)}>Deletar questionário</button>
                                    </li>: null
                            ))}
                        </ul>
                    ))}
                </ul>
            </div>

            <div className="new-quiz-container">
                <h1>Cadastrar Questionário</h1>
                <form onSubmit={handleNewQuiz}>
                    <textarea placeholder="Título do questionário" className="new-quiz-description" onChange={event => setNewQuiz(event.target.value)}/>
                    <select name="categories" onChange={event => setCategory(event.target.value)} defaultValue={'default'}>
                    <option value="default" disabled>Escolha uma categoria</option>
                        {categories.map(category => (
                            <option key={category.id} value={category.id}>{category.title}</option>
                        ))}
                    </select>
                    <button type="submit">Cadastrar questionário</button>
                </form>
            </div>

            <div className="new-category-container">
            <h1>Cadastrar Categoria</h1>
                <form onSubmit={handleNewCategory}>
                    <textarea placeholder="Nome da categoria" className="new-quiz-description" onChange={event => setNewCategory(event.target.value)}/>
                    <button type="submit">Cadastrar categoria</button>
                </form>
            </div>
        </div>
    )
}