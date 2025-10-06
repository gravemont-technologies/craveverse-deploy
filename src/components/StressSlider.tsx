import React from 'react';
import * as Slider from '@radix-ui/react-slider';

type StressSliderProps = {
  value: number;
  onChange: (val: number) => void;
};

const StressSlider: React.FC<StressSliderProps> = ({ value, onChange }) => {
  return (
    <Slider.Root
      className="relative flex items-center w-full h-5 select-none touch-none"
      value={[value]}
      onValueChange={(vals) => onChange(vals[0])}
      max={10}
      step={1}
    >
      <Slider.Track className="bg-gray-300 relative flex-1 rounded-full h-2">
        <Slider.Range className="absolute bg-gradient-to-r from-green-400 to-red-500 rounded-full h-full" />
      </Slider.Track>
      <Slider.Thumb className="block w-5 h-5 bg-white border border-gray-400 rounded-full shadow-md" />
    </Slider.Root>
  );
};

export default React.memo(StressSlider);
