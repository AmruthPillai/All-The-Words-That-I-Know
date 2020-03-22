import React from 'react';

const Logo = ({ size = 200 }) => {
  return (
    <div
      style={{ width: size, height: size, fontSize: size / 8 }}
      className="flex items-center pl-4 text-white font-bold bg-primary
      hover:bg-white hover:text-primary transition-colors duration-100 ease-in-out"
    >
      All The
      <br />
      Words
      <br />
      That
      <br />
      I Know
      <br />
    </div>
  );
};

export default Logo;
