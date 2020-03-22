import shortid from 'shortid';
import React, { useReducer, useEffect, useMemo } from 'react';

const correctWords = [
  'sad',
  'bad',
  'mad',
  'cad',
  'lad',
  'dad',
  'pad',
  'rad',
  'tad',
  'nad',
  'fad',
  'god',
];

const initialState = {
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

  // Time Ticker
  useEffect(() => {
    const ticker = setInterval(() => {
      const payload = state.timeRemaining - 1;
      if (payload >= 0) {
        return dispatch({ type: 'update_time', payload });
      }
      return () => clearInterval(ticker);
    }, 1000);
    return () => clearInterval(ticker);
  }, [state.timeRemaining]);

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

  const checkWord = () => {
    const word = state.currentWord.trim().toLowerCase();
    const correct = correctWords.includes(word) && !state.words.some((x) => x.word === word);

    dispatch({
      type: 'add_word',
      payload: { word, correct },
    });
  };

  return (
    <div className="mt-5 p-8 rounded shadow-xl">
      <div className="flex">
        <input
          className="w-5/6 rounded border-2 px-6 py-3 focus:outline-none focus:border-gray-500"
          type="text"
          value={state.currentWord}
          onChange={(x) => dispatch({ type: 'word_onchange', payload: x.target.value })}
          placeholder="Enter a word here"
        />
        <button
          className="w-1/6 ml-6 rounded py-3 focus:outline-none
            bg-gray-600 bg-green-600 hover:bg-green-700"
          type="button"
          onClick={checkWord}
        >
          <span className="material-icons text-white font-bold align-middle">check</span>
        </button>
      </div>

      <p className="text-xs text-gray-600 mt-2 ml-6">
        You are on Easy difficulty, so you can enter any word with a minimum length of 3 within 30
        seconds.
      </p>

      <div className="flex mt-8">
        <div className="w-1/3 shadow-md text-center rounded py-6">
          <h6 className="text-xs uppercase font-bold text-gray-500">No. of Correct Words</h6>
          <h3 className="mt-2 font-bold text-green-600 text-4xl">{numCorrect}</h3>
        </div>
        <div className="w-1/3 shadow-md mx-6 text-center rounded py-6">
          <h6 className="text-xs uppercase font-bold text-gray-500">No. of Incorrect Words</h6>
          <h3 className="mt-2 font-bold text-red-600 text-4xl">{numIncorrect}</h3>
        </div>
        <div className="w-1/3 shadow-md text-center rounded py-6">
          <h6 className="text-xs uppercase font-bold text-gray-500">Time Remaining</h6>
          <h3 className="mt-2 font-bold text-blue-600 text-4xl">{timeRemaining}</h3>
        </div>
      </div>

      <div className="mt-8">
        <h6 className="text-xs uppercase font-bold text-gray-500">History</h6>
        <div id="history" className="mt-2">
          {state.words.map((x) => (
            <span key={x.id} className="rounded-full px-4 py-1 bg-gray-600 text-white text-sm mr-2">
              {x.word}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Game;
