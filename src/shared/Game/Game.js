import shortid from 'shortid';
import React, { useReducer, useMemo } from 'react';

import useFocus from '../../hooks/useFocus';
import words from './words.json';

const initialState = {
  playing: false,
  currentWord: '',
  timeRemaining: 10,
  words: [
    {
      id: '1',
      word: 'aubergine',
      correct: true,
      addedOn: 124,
    },
    {
      id: '2',
      word: 'langoostine',
      correct: false,
      addedOn: 122,
    },
  ],
};

const reducer = (state, action) => {
  switch (action.type) {
    case 'play_status':
      return { ...state, playing: action.payload };
    case 'update_time':
      return action.payload >= 0 ? { ...state, timeRemaining: action.payload } : state;
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
            addedOn: state.timeRemaining,
          },
          ...state.words,
        ],
      };
    default:
      return state;
  }
};

const Game = () => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const validateInput = useMemo(() => {
    const alphaOnly = /^[A-Za-z]+$/;
    const word = state.currentWord;

    if (word === '') {
      return false;
    }

    if (word.length < 3) {
      return false;
    }

    if (!word.match(alphaOnly)) {
      return false;
    }

    return true;
  }, [state.currentWord]);

  const [inputRef, setInputFocus] = useFocus();

  const numCorrect = useMemo(() => {
    return state.words.filter((x) => x.correct).length;
  }, [state.words]);

  const numIncorrect = useMemo(() => {
    return state.words.filter((x) => !x.correct).length;
  }, [state.words]);

  const timeRemaining = useMemo(() => {
    const minutes = Math.floor(state.timeRemaining / 60)
      .toString()
      .padStart(2, '0');
    const seconds = (state.timeRemaining - minutes * 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
  }, [state.timeRemaining]);

  const checkWord = (e) => {
    if (e.target.disabled) return;

    const word = state.currentWord.trim().toLowerCase();
    const correct = word in words && !state.words.some((x) => x.word === word);

    dispatch({
      type: 'add_word',
      payload: { word, correct },
    });
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && validateInput) {
      checkWord(e);
    }
  };

  const startGame = () => {
    setInputFocus();
    dispatch({ type: 'play_status', payload: true });
    
  };

  return (
    <div className="mt-4 py-6 md:py-12 md:px-8 rounded shadow-none md:shadow-xl relative">
      <div className={`${state.playing ? '' : 'blur'}`}>
        <div className="flex">
          <input
            className="w-5/6 rounded border-2 px-6 py-3 focus:outline-none focus:border-gray-500"
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
            disabled={!validateInput}
            onClick={checkWord}
          >
            <span className="material-icons text-white font-bold align-middle">check</span>
          </button>
        </div>

        <p className="text-xs text-gray-600 mt-2 ml-6">
          You are on Easy difficulty, so you can enter any word with a minimum length of 3 within 30
          seconds.
        </p>

        <div className="grid col-gap-4 grid-cols-2 md:grid-cols-3 mt-8">
          <div className="shadow md:shadow-md text-center rounded py-6">
            <h6 className="text-xs uppercase font-bold text-gray-500">No. of Correct Words</h6>
            <h3 className="mt-2 font-bold text-green-600 text-4xl">{numCorrect}</h3>
          </div>
          <div className="shadow md:shadow-md text-center rounded py-6">
            <h6 className="text-xs uppercase font-bold text-gray-500">No. of Incorrect Words</h6>
            <h3 className="mt-2 font-bold text-red-600 text-4xl">{numIncorrect}</h3>
          </div>
          <div
            className="col-span-2 md:col-span-1 mt-4 md:mt-0
          shadow md:shadow-md text-center rounded py-6"
          >
            <h6 className="text-xs uppercase font-bold text-gray-500">Time Remaining</h6>
            <h3 className="mt-2 font-bold text-blue-600 text-4xl">{timeRemaining}</h3>
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

      {!state.playing && (
        <div
          id="overlay"
          style={{ backgroundColor: 'rgba(113, 128, 150, 0.9)' }}
          className="absolute inset-0 rounded text-white text-center
          flex flex-col justify-center items-center"
        >
          <h2 className="font-bold text-3xl">How many words do you know?</h2>
          <p className="w-1/2">
            Test your memory and vocabulary in this fast-paced game where you have to enter as many
            valid words as possible in a given time.
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
    </div>
  );
};

export default Game;
