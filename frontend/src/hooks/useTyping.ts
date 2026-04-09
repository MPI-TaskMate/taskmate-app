import { useEffect, useState } from "react";

export function useTyping(text: string, speed = 50) {
  const [displayedText, setDisplayedText] = useState("");

  useEffect(() => {
    let index = 0;
    setDisplayedText("");

    const interval = setInterval(() => {
      setDisplayedText(text.slice(0, index + 1));
      index++;

      if (index >= text.length) {
        clearInterval(interval);
      }
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed]);

  return displayedText;
}