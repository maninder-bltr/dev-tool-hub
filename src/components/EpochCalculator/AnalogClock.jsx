// src/components/EpochCalculator/AnalogClock.jsx
import React from 'react';
import './AnalogClock.css'

const AnalogClock = ({ date, size = 140 }) => {
  if (!date) return null;

  const seconds = date.getSeconds();
  const minutes = date.getMinutes();
  const hours = date.getHours() % 12;

  const secondDeg = seconds * 6;
  const minuteDeg = minutes * 6 + seconds * 0.1;
  const hourDeg = hours * 30 + minutes * 0.5;

  // Clock marks for hours (12 positions)
  const marks = [
    { hour: 0, label: '12' },
    { hour: 1, label: '1' },
    { hour: 2, label: '2' },
    { hour: 3, label: '3' },
    { hour: 4, label: '4' },
    { hour: 5, label: '5' },
    { hour: 6, label: '6' },
    { hour: 7, label: '7' },
    { hour: 8, label: '8' },
    { hour: 9, label: '9' },
    { hour: 10, label: '10' },
    { hour: 11, label: '11' }
  ];

  return (
    <div className="analog-clock" style={{ width: size, height: size }}>
      {/* Hour marks */}
      {marks.map((mark) => (
        <div
          key={mark.hour}
          className="clock-mark"
          data-hour={mark.hour}
        >
          <span className={`mark-number ${mark.hour === 0 ? 'twelve' : ''}`}>
            {mark.label}
          </span>
        </div>
      ))}

      {/* Hour hand */}
      <div 
        className="hand hour-hand" 
        style={{ transform: `rotate(${hourDeg}deg)` }}
      />
      
      {/* Minute hand */}
      <div 
        className="hand minute-hand" 
        style={{ transform: `rotate(${minuteDeg}deg)` }}
      />
      
      {/* Second hand */}
      <div 
        className="hand second-hand" 
        style={{ transform: `rotate(${secondDeg}deg)` }}
      />
      
      {/* Center dot */}
      <div className="clock-center" />
    </div>
  );
};

export default AnalogClock;