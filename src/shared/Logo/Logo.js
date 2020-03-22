import React from 'react';

const Logo = ({ size = 200 }) => {
  return (
    <div
      style={{ width: size, height: size, fontSize: size / 8 }}
      className="flex flex-col justify-center pl-4 text-white font-bold bg-primary
      hover:bg-white hover:text-primary transition duration-200 ease-in-out"
    >
      <span>All The</span>
      <span>Words</span>
      <span>That</span>
      <span>I Know</span>
    </div>
  );
};

export default Logo;
