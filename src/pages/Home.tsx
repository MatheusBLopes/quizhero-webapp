import React, { useState, useEffect, FormEvent } from "react";
import ReactModal from "react-modal";
import CSS from "csstype";

import api from "../services/api";

import "../styles/home.scss";

type Answer = {
  id?: number;
  description: string | undefined;
  true_or_false: boolean | undefined;
};

type NewAnswer = {
  id: number;
  description?: string;
  true_or_false?: boolean;
};

type Question = {
  id: string;
  description: string;
  answers: [Answer];
  answered?: boolean | undefined;
};

type Quiz = {
  id: string;
  title: string;
  category: string;
};

type Category = {
  id: string;
  title: string;
};

export function Home() {
  function shuffle(array: any) {
    var m = array.length,
      t,
      i;

    // While there remain elements to shuffle…
    while (m) {
      // Pick a remaining element…
      i = Math.floor(Math.random() * m--);

      // And swap it with the current element.
      t = array[m];
      array[m] = array[i];
      array[i] = t;
    }

    return array;
  }

  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [category, setCategory] = useState("");
  const [newQuiz, setNewQuiz] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [newQuestion, setNewQestion] = useState("");

  const [quiz, setQuiz] = useState<Quiz>();
  const [questions, setQuestions] = useState<Question[]>([]);

  useEffect(() => {
    api.get("quiz/", {}).then((response) => {
      setQuizzes(response.data.results);
    });
  }, [newQuiz]);

  useEffect(() => {
    api.get("category/", {}).then((response) => {
      setCategories(response.data.results);
    });
  }, [newCategory]);

  async function handleNewQuiz(e: FormEvent) {
    e.preventDefault();

    const quiz = {
      title: newQuiz,
      category: category,
      questions: [],
    };
    await api.post("quiz/", quiz);
    window.confirm("Questionário criado com sucesso!");
    handleOpenCreateQuizModal();
  }

  async function handleDeleteQuiz(quizId: string) {
    if (window.confirm("Tem certeza que deseja excluir esse questionário?")) {
      await api.delete(`quiz/${quizId}/`);
      setQuizzes(quizzes.filter((quiz) => quiz.id !== quizId));
    }
  }

  async function handleNewCategory(e: FormEvent) {
    e.preventDefault();

    const data = {
      title: newCategory,
    };
    await api.post("category/", data);
    window.confirm("Cateogria criado com sucesso!");
    handleOpenCreateCategoryModal();
  }

  async function handleCurrentQuiz(id: string) {
    api.get(`quiz/${id}/`).then((response) => {
      setQuiz(response.data);
      const shuffledQuestions = shuffle(response.data.questions)
      setQuestions(shuffledQuestions);
    });
  }

  const rightQuestion: CSS.Properties = {
    border: "4px solid #52B788",
  };

  const wrongQuestion: CSS.Properties = {
    border: "4px solid #E73F5D",
  };

  const notAnsweredQuestion: CSS.Properties = {
    border: "4px solid #333333",
  };

  function handleDeleteQuestion(questionId: string) {
    if (window.confirm("Tem certeza que deseja excluir essa pergunta?")) {
      api.delete(`questions/${questionId}/`);
      setQuestions(questions.filter((question) => question.id !== questionId));
    }
  }

  function handleAnswerQuestion(id: string) {
    let questionsList = questions;
    questionsList.forEach((question) => {
      if (question.id === id) {
        question.answered = true;
      }
    });

    setQuestions([...questionsList]);
  }

  const [newAnswerList, setNewAnswerList] = useState<NewAnswer[]>([]);
  async function handleNewQuestion(e: FormEvent) {
    e.preventDefault();
    const answers: any = [];
    newAnswerList.forEach((answer) => {
      let answerWithoutId: Answer = { description: "", true_or_false: false };
      answerWithoutId.description = answer.description;
      answerWithoutId.true_or_false = answer.true_or_false;
      answers.push(answerWithoutId);
    });

    if (quiz) {
      const question = {
        quiz: parseInt(quiz.id),
        description: newQuestion,
        answers: answers,
      };

      await api.post("questions/", question);
      await api.get(`quiz/${quiz.id}/`).then((response) => {
        setQuiz(response.data);
        setQuestions(response.data.questions);
      });
    }
  }

  function handleUpdateAnswer(
    text: string | undefined,
    id: number,
    true_or_false: boolean | undefined
  ) {
    let answerListUpdated = newAnswerList;

    if (text) {
      newAnswerList.forEach((answer, index) => {
        if (answerListUpdated[index].id === id) {
          answerListUpdated[index].description = text;
        }
      });
    }

    if (true_or_false !== undefined) {
      newAnswerList.forEach((answer, index) => {
        if (answerListUpdated[index].id === id) {
          answerListUpdated[index].true_or_false = true_or_false;
        } else {
          answerListUpdated[index].true_or_false = false;
        }
      });
    }

    setNewAnswerList(answerListUpdated);
  }

  function handleRemoveNewAnswer(id: number) {
    setNewAnswerList(newAnswerList.filter((newAnswer) => newAnswer.id !== id));
  }

  function handleCreateNewAnswer() {
    let newAnswer: NewAnswer = { id: 0 };
    if (newAnswerList.length === 0) {
      newAnswer.id = 1;
    } else if (newAnswerList.length > 0) {
      let lastId = newAnswerList[newAnswerList.length - 1].id;
      newAnswer.id = lastId + 1;
    }

    newAnswer.description = "";
    newAnswer.true_or_false = false;

    setNewAnswerList([...newAnswerList, newAnswer]);
  }

  const [openCreateQuizModal, setOpenCreateQuizModal] = useState(false);
  const [openCreateCategoryModal, setOpenCreateCategoryModal] = useState(false);

  function handleOpenCreateQuizModal() {
    if (openCreateQuizModal === true) {
      setOpenCreateQuizModal(false);
    } else {
      setOpenCreateQuizModal(true);
    }
  }

  function handleOpenCreateCategoryModal() {
    if (openCreateCategoryModal === true) {
      setOpenCreateCategoryModal(false);
    } else {
      setOpenCreateCategoryModal(true);
    }
  }

  async function handleDeleteCategory(id: string) {
    if (window.confirm("Tem certeza que deseja excluir essa categoria?")) {
      await api.delete(`category/${id}/`);
      setCategories(categories.filter((category) => category.id !== id));
    }
  }

  return (
    <div className="home-page">
      <header>
        <h1>QUIZHERO</h1>
        <h3>{quiz ? quiz.title : null}</h3>
        {quiz ? (
          <button onClick={() => handleDeleteQuiz(quiz.id)}>
            Deletar questionário
          </button>
        ) : null}
      </header>

      <aside>
        <div className="search-container">
          <span>Buscar questionário</span>
          <textarea></textarea>
          <button>Buscar</button>
        </div>
        <div className="quizzes-list">
          {categories.map((category) => (
            <>
              <h3 key={category.id}>{category.title}</h3>
              {quizzes.map((quiz) =>
                quiz.category === category.id ? (
                  <button
                    key={quiz.id}
                    type="button"
                    onClick={() => handleCurrentQuiz(quiz.id)}
                  >
                    <div />
                    {quiz.title}
                  </button>
                ) : null
              )}
            </>
          ))}
        </div>

        <div id="create-buttons-container">
          <button
            onClick={() => {
              handleOpenCreateQuizModal();
            }}
          >
            Cadastrar questionário
          </button>
          <button
            onClick={() => {
              handleOpenCreateCategoryModal();
            }}
          >
            Cadastrar categoria
          </button>
        </div>
      </aside>

      <ReactModal
        className="modal create-new-quiz-modal"
        overlayClassName="modal-overlay"
        isOpen={openCreateQuizModal}
      >
        <h1>Cadastrar Questionário</h1>
        <form onSubmit={handleNewQuiz}>
          <textarea
            placeholder="Título do questionário"
            onChange={(event) => setNewQuiz(event.target.value)}
          />
          <select
            name="categories"
            onChange={(event) => setCategory(event.target.value)}
            defaultValue={"default"}
          >
            <option value="default" disabled>
              Escolha uma categoria
            </option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.title}
              </option>
            ))}
          </select>
          <button type="submit">Cadastrar questionário</button>
        </form>
        <button
          onClick={() => {
            handleOpenCreateQuizModal();
          }}
          className="cancel-button"
        >
          Cancelar
        </button>
      </ReactModal>

      <ReactModal
        className="modal create-new-category-modal"
        overlayClassName="modal-overlay"
        isOpen={openCreateCategoryModal}
      >
        <h1>Cadastrar Categoria</h1>
        <form onSubmit={handleNewCategory}>
          <textarea
            placeholder="Nome da categoria"
            className="new-quiz-description"
            onChange={(event) => setNewCategory(event.target.value)}
          />
          <button type="submit">Cadastrar categoria</button>
        </form>
        <button
          onClick={() => {
            handleOpenCreateCategoryModal();
          }}
          className="cancel-button"
        >
          Cancelar
        </button>
      </ReactModal>

      <div className="quiz-container">
        {questions.map((question) => (
          <div key={question.id} className="question">
            <p className="question-decription">{question.description}</p>

            <p>Escolha uma alternativa</p>

            {question.answers.map((answer) => (
              <button
                key={answer.id}
                style={
                  question.answered === true
                    ? answer.true_or_false === true
                      ? rightQuestion
                      : wrongQuestion
                    : notAnsweredQuestion
                }
                className="answer-button"
                onClick={() => handleAnswerQuestion(question.id)}
              >
                {answer.description}
              </button>
            ))}

            <button
              type="button"
              className="delete-question-button"
              onClick={() => handleDeleteQuestion(question.id)}
            >
              Deletar questão
            </button>
          </div>
        ))}

        {quiz ? (
          <div className="create-question">
            <form onSubmit={handleNewQuestion}>
              <p>Cadastrar nova questão</p>

              <textarea
                onChange={(event) => setNewQestion(event.target.value)}
              ></textarea>

              {newAnswerList.map((newAnswer) => (
                <div key={newAnswer.id}>
                  <p>Resposta</p>
                  <textarea
                    onChange={(event) =>
                      handleUpdateAnswer(
                        event.target.value,
                        newAnswer.id,
                        undefined
                      )
                    }
                  ></textarea>
                  <label>
                    <input
                      type="radio"
                      name="new-question"
                      value={`answer-${newAnswer.id}`}
                      onChange={(event) =>
                        handleUpdateAnswer(
                          undefined,
                          newAnswer.id,
                          event.target.checked
                        )
                      }
                    />
                    Resposta certa
                  </label>
                  <button
                    className="delete-answer-button"
                    onClick={() => handleRemoveNewAnswer(newAnswer.id)}
                  >
                    Deletar resposta
                  </button>
                </div>
              ))}

              <button type="button" onClick={() => handleCreateNewAnswer()}>
                Adicionar resposta
              </button>
              <button type="submit">Cadastrar questão</button>
            </form>
          </div>
        ) : null}
      </div>
    </div>
  );
}
