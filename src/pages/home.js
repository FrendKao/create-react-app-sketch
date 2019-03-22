import React from 'react';
import DragonImg from '../assets/dragon.jpg';

export default function Home() {
  return (
    <div>
      <h2>Home</h2>
      <img src={DragonImg} width="100" alt="dragon" />
    </div>
  );
}
