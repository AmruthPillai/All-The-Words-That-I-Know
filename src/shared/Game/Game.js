import shortid from 'shortid';
import React, { useState, useReducer, useMemo } from 'react';

import useFocus from '../../hooks/useFocus';
import words from './words.json';

const GAME_CONFIG = {
  lazy: {
    key: 'lazy',
    timer: 0,
    minLength: 3,
  },
  easy: {
    key: 'easy',
    timer: 30,
    minLength: 3,
  },
  medium: {
    key: 'medium',
    timer: 45,
    minLength: 6,
  },
  hard: {
    key: 'hard',
    timer: 60,
    minLength: 8,
  },
};

const initialState = {
  error: '',
  status: 'stopped', // values: 'stopped' | 'playing' | 'game_over'
  currentWord: '',
  words: [],
};

const reducer = (state, action) => {
  switch (action.type) {
    case 'game_status':
      return { ...state, status: action.payload };
    case 'set_error':
      return { ...state, error: action.payload };
    case 'word_onchange':
      return { ...state, currentWord: action.payload };
    case 'add_word':
      return {
        ...state,
        currentWord: '',
        words: [
          {
            id: shortid.generate(),
            word: action.payload.word,
            correct: action.payload.correct,
            addedOn: action.payload.timeRemaining,
          },
          ...state.words,
        ],
      };
    case 'reset_game':
      return initialState;
    default:
      return state;
  }
};

const Game = () => {
  let tickerRef = null;
  const [difficulty, setDifficulty] = useState('easy');
  const [minLength, setMinLength] = useState(GAME_CONFIG.easy.minLength);
  const [timeRemaining, setTimeRemaining] = useState(GAME_CONFIG.easy.timer);

  const [state, dispatch] = useReducer(reducer, initialState);

  const validateInput = useMemo(() => {
    const alphaOnly = /^[A-Za-z]+$/;
    const word = state.currentWord;

    if (word === '') {
      dispatch({ type: 'set_error', payload: '' });
      return false;
    }

    if (word.length < minLength) {
      dispatch({
        type: 'set_error',
        payload: `The word must be at least ${minLength} characters long.`,
      });
      return false;
    }

    if (!word.match(alphaOnly)) {
      dispatch({
        type: 'set_error',
        payload: 'The word must only contain letters, no numbers or special characters allowed.',
      });
      return false;
    }

    dispatch({ type: 'set_error', payload: '' });
    return true;
  }, [state.currentWord, minLength]);

  const [inputRef, setInputFocus, clearInputFocus] = useFocus();

  const numCorrect = useMemo(() => {
    return state.words.filter((x) => x.correct).length;
  }, [state.words]);

  const numIncorrect = useMemo(() => {
    return state.words.filter((x) => !x.correct).length;
  }, [state.words]);

  const formattedTimeRemaining = useMemo(() => {
    const minutes = Math.floor(timeRemaining / 60)
      .toString()
      .padStart(2, '0');
    const seconds = (timeRemaining - minutes * 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
  }, [timeRemaining]);

  const checkWord = (e) => {
    if (state.status !== 'playing') return;
    if (e.target.disabled) return;

    const word = state.currentWord.trim().toLowerCase();
    const correct = word in words && !state.words.some((x) => x.word === word);

    dispatch({
      type: 'add_word',
      payload: { word, correct, timeRemaining },
    });
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && validateInput) {
      checkWord(e);
    }
  };

  const gameOver = () => {
    dispatch({ type: 'game_status', payload: 'game_over' });
    clearInterval(tickerRef);
    clearInputFocus();
    tickerRef = null;
    return 0;
  };

  const startGame = () => {
    dispatch({ type: 'game_status', payload: 'playing' });
    setInputFocus();

    if (difficulty === 'lazy') return;

    tickerRef = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev > 1) return prev - 1;
        return gameOver();
      });
    }, 1000);
  };

  const restartGame = () => {
    setDifficulty('easy');
    setTimeRemaining(GAME_CONFIG.easy.timer);

    dispatch({ type: 'reset_game' });
    dispatch({ type: 'game_status', payload: 'stopped' });
  };

  return (
    <div className="my-6 py-6 md:py-12 md:px-8 rounded shadow-none md:shadow-xl relative">
      <div className={`${state.status === 'playing' ? '' : 'blur'}`}>
        <div className="flex">
          <input
            className={`w-5/6 rounded border-2 px-6 py-3 focus:outline-none ${
              state.error !== '' ? 'focus:border-red-600' : 'focus:border-gray-500'
            }`}
            type="text"
            ref={inputRef}
            value={state.currentWord}
            onKeyPress={handleKeyPress}
            onChange={(x) => dispatch({ type: 'word_onchange', payload: x.target.value })}
            placeholder="Enter a word here"
          />
          <button
            className={`w-1/6 ml-6 rounded py-3 focus:outline-none ${
              validateInput ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-600'
            }`}
            type="button"
            disabled={state.status !== 'playing' && !validateInput}
            onClick={checkWord}
          >
            <span className="material-icons text-white font-bold align-middle">check</span>
          </button>
        </div>

        {state.error !== '' ? (
          <p className="text-xs text-red-600 mt-2 ml-6">{state.error}</p>
        ) : (
          <p className="text-xs text-gray-600 mt-2 ml-6">
            {`You are on ${difficulty} difficulty, so you must enter a word with
            at least ${minLength} characters.`}
          </p>
        )}

        <div className="grid col-gap-4 grid-cols-2 md:grid-cols-3 mt-8">
          <div className="shadow md:shadow-md text-center rounded p-6">
            <h6 className="text-xs uppercase font-bold text-gray-500">No. of Correct Words</h6>
            <h3 className="mt-2 font-bold text-green-600 text-4xl">{numCorrect}</h3>
          </div>
          <div className="shadow md:shadow-md text-center rounded p-6">
            <h6 className="text-xs uppercase font-bold text-gray-500">No. of Incorrect Words</h6>
            <h3 className="mt-2 font-bold text-red-600 text-4xl">{numIncorrect}</h3>
          </div>
          <div
            className={`col-span-2 md:col-span-1 mt-4 md:mt-0
          shadow md:shadow-md text-center rounded p-6 ${difficulty === 'lazy' && 'opacity-25'}`}
          >
            <h6 className="text-xs uppercase font-bold text-gray-500">Time Remaining</h6>
            <h3 className="mt-2 font-bold text-blue-600 text-4xl">{formattedTimeRemaining}</h3>
          </div>
        </div>

        <div className="mt-8">
          <h6 className="text-xs uppercase font-bold text-gray-500">History</h6>
          <div id="history" className="flex flex-wrap mt-2">
            {state.words.map((x) => (
              <span
                key={x.id}
                className={`rounded-full px-4 py-1 my-1 text-white
                text-sm mr-2 ${x.correct ? 'bg-green-600' : 'bg-gray-600'}`}
              >
                {x.word}
              </span>
            ))}
          </div>
        </div>
      </div>

      {state.status === 'stopped' && (
        <div
          id="overlay"
          style={{ backgroundColor: 'rgba(113, 128, 150, 0.9)' }}
          className="absolute inset-0 p-6 rounded text-white text-center
          flex flex-col justify-center items-center"
        >
          <h2 className="font-bold text-3xl">How many words do you know?</h2>
          <p className="md:w-1/2 mt-2">
            Test your memory and vocabulary in this fast-paced game where you have to enter as many
            valid words as possible in a given time.
          </p>

          <div className="mt-8 inline-flex">
            <button
              type="button"
              onClick={() => {
                setDifficulty(GAME_CONFIG.lazy.key);
                setMinLength(GAME_CONFIG.lazy.minLength);
                setTimeRemaining(GAME_CONFIG.lazy.timer);
              }}
              className={`${
                difficulty === 'lazy' ? 'bg-gray-500' : 'bg-gray-300'
              } hover:bg-gray-500 focus:outline-none text-gray-800
              py-2 px-4 text-sm rounded-l`}
            >
              Lazy
            </button>
            <button
              type="button"
              onClick={() => {
                setDifficulty(GAME_CONFIG.easy.key);
                setMinLength(GAME_CONFIG.easy.minLength);
                setTimeRemaining(GAME_CONFIG.easy.timer);
              }}
              className={`${
                difficulty === 'easy' ? 'bg-gray-500' : 'bg-gray-300'
              } hover:bg-gray-500 focus:outline-none text-gray-800
              py-2 px-4 text-sm`}
            >
              Easy
            </button>
            <button
              type="button"
              onClick={() => {
                setDifficulty(GAME_CONFIG.medium.key);
                setMinLength(GAME_CONFIG.medium.minLength);
                setTimeRemaining(GAME_CONFIG.medium.timer);
              }}
              className={`${
                difficulty === 'medium' ? 'bg-gray-500' : 'bg-gray-300'
              } hover:bg-gray-500 focus:outline-none text-gray-800
              py-2 px-4 text-sm`}
            >
              Medium
            </button>
            <button
              type="button"
              onClick={() => {
                setDifficulty(GAME_CONFIG.hard.key);
                setMinLength(GAME_CONFIG.hard.minLength);
                setTimeRemaining(GAME_CONFIG.hard.timer);
              }}
              className={`${
                difficulty === 'hard' ? 'bg-gray-500' : 'bg-gray-300'
              } hover:bg-gray-500 focus:outline-none text-gray-800
              py-2 px-4 text-sm rounded-r`}
            >
              Hard
            </button>
          </div>

          <p className="md:w-1/2 mt-6 text-sm">
            In <strong>{difficulty}</strong> difficulty, you have to come up with as many words as
            possible that are{' '}
            <strong>
              at least {minLength} letters long and within {timeRemaining} seconds.
            </strong>
          </p>

          <button
            type="button"
            className="mt-8 px-6 py-2 rounded bg-primary hover:bg-red-600"
            onClick={startGame}
          >
            Start Game
          </button>
        </div>
      )}

      {state.status === 'game_over' && (
        <div
          id="overlay"
          style={{ backgroundColor: 'rgba(113, 128, 150, 0.9)' }}
          className="absolute inset-0 p-6 rounded text-white text-center
          flex flex-col justify-center items-center"
        >
          <h2 className="font-bold text-3xl">Game Over!</h2>
          <div className="md:w-1/2 mt-4">
            <div className="grid col-gap-4 grid-cols-2">
              <div className="shadow md:shadow-md text-center rounded p-6 bg-white">
                <h6 className="text-xs uppercase font-bold text-gray-500">No. of Correct Words</h6>
                <h3 className="mt-2 font-bold text-green-600 text-4xl">{numCorrect}</h3>
              </div>
              <div className="shadow md:shadow-md text-center rounded p-6 bg-white">
                <h6 className="text-xs uppercase font-bold text-gray-500">
                  No. of Incorrect Words
                </h6>
                <h3 className="mt-2 font-bold text-red-600 text-4xl">{numIncorrect}</h3>
              </div>
            </div>
          </div>

          <button
            type="button"
            className="mt-8 px-6 py-2 rounded bg-primary hover:bg-red-600"
            onClick={restartGame}
          >
            Restart
          </button>
        </div>
      )}
    </div>
  );
};

export default Game;
