/* eslint-disable no-unused-expressions */
import { useRef } from 'react';

const useFocus = () => {
  const ref = useRef(null);

  const focus = () => {
    ref.current && ref.current.focus();
  };

  const blur = () => {
    ref.current && ref.current.blur();
  };

  return [ref, focus, blur];
};

export default useFocus;
