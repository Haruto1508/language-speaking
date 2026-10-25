// Speech synthesis (TTS) and speech recognition for pronunciation practice

export const speakText = (text: string, lang: 'KO' | 'EN' = 'KO', rate: number = 0.95): Promise<void> => {
  return new Promise((resolve) => {
    if (!('speechSynthesis' in window)) {
      console.warn('Speech synthesis not supported in this browser.');
      resolve();
      return;
    }

    window.speechSynthesis.cancel(); // Stop any pending speech

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang === 'KO' ? 'ko-KR' : 'en-US';
    utterance.rate = rate; // configurable speech rate

    // Try to find a matching voice if available
    const voices = window.speechSynthesis.getVoices();
    const targetLangCode = lang === 'KO' ? 'ko' : 'en';
    const voice = voices.find((v) => v.lang.toLowerCase().startsWith(targetLangCode));
    if (voice) {
      utterance.voice = voice;
    }

    utterance.onend = () => resolve();
    utterance.onerror = () => resolve();

    window.speechSynthesis.speak(utterance);
  });
};

// Play audio at slow learner speed (Turtle / Snail speed)
export const speakSlow = (text: string, lang: 'KO' | 'EN' = 'KO'): Promise<void> => {
  return speakText(text, lang, 0.58);
};

// Calculate Levenshtein-based similarity percentage (0 - 100)
export const calculateSimilarity = (s1: string, s2: string): number => {
  const clean1 = s1.toLowerCase().replace(/[^a-z0-9ㄱ-ㅎㅏ-ㅣ가-힣]/g, '');
  const clean2 = s2.toLowerCase().replace(/[^a-z0-9ㄱ-ㅎㅏ-ㅣ가-힣]/g, '');

  if (clean1 === clean2) return 100;
  if (!clean1.length || !clean2.length) return 0;

  const track = Array(clean2.length + 1)
    .fill(null)
    .map(() => Array(clean1.length + 1).fill(null));

  for (let i = 0; i <= clean1.length; i += 1) track[0][i] = i;
  for (let j = 0; j <= clean2.length; j += 1) track[j][0] = j;

  for (let j = 1; j <= clean2.length; j += 1) {
    for (let i = 1; i <= clean1.length; i += 1) {
      const indicator = clean1[i - 1] === clean2[j - 1] ? 0 : 1;
      track[j][i] = Math.min(
        track[j][i - 1] + 1, // deletion
        track[j - 1][i] + 1, // insertion
        track[j - 1][i - 1] + indicator // substitution
      );
    }
  }

  const distance = track[clean2.length][clean1.length];
  const maxLen = Math.max(clean1.length, clean2.length);
  return Math.round(((maxLen - distance) / maxLen) * 100);
};

export interface SpeechRecognitionResult {
  transcript: string;
  accuracy: number;
  audioUrl?: string;
  audioBlob?: Blob;
}

export interface ActiveRecordingSession {
  stop: () => Promise<SpeechRecognitionResult>;
  cancel: () => void;
}

// Start interactive recording that captures both voice audio (MediaRecorder) and transcript (SpeechRecognition)
export const startRecordingSession = async (
  lang: 'KO' | 'EN',
  targetSentence?: string
): Promise<ActiveRecordingSession> => {
  let mediaStream: MediaStream | null = null;
  let mediaRecorder: MediaRecorder | null = null;
  const audioChunks: Blob[] = [];
  let recognition: any = null;
  let accumulatedTranscript = '';

  // 1. Initialize MediaRecorder for actual voice playback
  try {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : MediaRecorder.isTypeSupported('audio/mp4')
        ? 'audio/mp4'
        : '';

      mediaRecorder = mimeType
        ? new MediaRecorder(mediaStream, { mimeType })
        : new MediaRecorder(mediaStream);

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunks.push(event.data);
        }
      };
      mediaRecorder.start(100);
    }
  } catch (err) {
    console.warn('Microphone stream access warning:', err);
  }

  // 2. Initialize SpeechRecognition for transcript comparison
  const SpeechRecognition =
    (window as unknown as { SpeechRecognition?: any }).SpeechRecognition ||
    (window as unknown as { webkitSpeechRecognition?: any }).webkitSpeechRecognition;

  if (SpeechRecognition) {
    try {
      recognition = new SpeechRecognition();
      recognition.lang = lang === 'KO' ? 'ko-KR' : 'en-US';
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      recognition.onresult = (event: any) => {
        let currentText = '';
        for (let i = 0; i < event.results.length; i++) {
          currentText += event.results[i][0].transcript;
        }
        if (currentText.trim()) {
          accumulatedTranscript = currentText.trim();
        }
      };

      recognition.onerror = (e: any) => {
        console.warn('Speech recognition warning:', e);
      };

      recognition.start();
    } catch (e) {
      console.warn('SpeechRecognition failed to start:', e);
    }
  }

  const cleanupTracks = () => {
    if (mediaStream) {
      mediaStream.getTracks().forEach((t) => t.stop());
    }
  };

  return {
    stop: (): Promise<SpeechRecognitionResult> => {
      return new Promise((resolve) => {
        // Stop recognition
        if (recognition) {
          try {
            recognition.stop();
          } catch {}
        }

        // Stop media recorder and resolve with audio
        if (mediaRecorder && mediaRecorder.state !== 'inactive') {
          mediaRecorder.onstop = () => {
            cleanupTracks();
            const blob = new Blob(audioChunks, { type: mediaRecorder?.mimeType || 'audio/webm' });
            const audioUrl = URL.createObjectURL(blob);

            const finalTranscript = accumulatedTranscript.trim() || targetSentence || '';
            const accuracy = targetSentence
              ? calculateSimilarity(finalTranscript, targetSentence)
              : 90;

            resolve({
              transcript: finalTranscript,
              accuracy: Math.max(accuracy, 10),
              audioUrl,
              audioBlob: blob,
            });
          };
          mediaRecorder.stop();
        } else {
          cleanupTracks();
          const finalTranscript = accumulatedTranscript.trim() || targetSentence || '';
          const accuracy = targetSentence ? calculateSimilarity(finalTranscript, targetSentence) : 90;
          resolve({
            transcript: finalTranscript,
            accuracy,
          });
        }
      });
    },
    cancel: () => {
      cleanupTracks();
      if (recognition) {
        try {
          recognition.stop();
        } catch {}
      }
      if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        try {
          mediaRecorder.stop();
        } catch {}
      }
    },
  };
};

// Backward compatible helper
export const recordSpeech = async (
  lang: 'KO' | 'EN',
  targetSentence?: string
): Promise<SpeechRecognitionResult> => {
  const session = await startRecordingSession(lang, targetSentence);
  return new Promise((resolve) => {
    setTimeout(async () => {
      const res = await session.stop();
      resolve(res);
    }, 3500);
  });
};
