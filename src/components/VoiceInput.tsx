import React, { useEffect, useState } from 'react';

type VoiceInputProps = {
  onResult: (text: string) => void;
};

const VoiceInput: React.FC<VoiceInputProps> = ({ onResult }) => {
  const [listening, setListening] = useState(false);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);

  useEffect(() => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) return;

    const rec = new (window.SpeechRecognition || (window as any).webkitSpeechRecognition)();
    rec.continuous = false;
    rec.interimResults = false;
    rec.lang = 'en-US';

    rec.onresult = (e) => onResult(e.results[0][0].transcript);
    rec.onend = () => setListening(false);

    setRecognition(rec);
  }, [onResult]);

  const toggleListening = () => {
    if (!recognition) return;
    if (listening) recognition.stop();
    else recognition.start();
    setListening(!listening);
  };

  return (
    <button
      className={`p-4 rounded-full border-2 ${listening ? 'border-red-500 animate-pulse' : 'border-gray-400'}`}
      onClick={toggleListening}
    >
      🎤
    </button>
  );
};

export default React.memo(VoiceInput);
