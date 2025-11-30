// Audio Context Singleton
let audioContext: AudioContext | null = null;

export const getAudioContext = (): AudioContext => {
  if (!audioContext) {
    // Gemini TTS usually outputs 24kHz
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({
      sampleRate: 24000,
    });
  }
  return audioContext;
};

// Helper to decode Base64 string to Uint8Array
const decodeBase64 = (base64: string): Uint8Array => {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
};

// Helper to convert Raw PCM (Int16) to AudioBuffer
const pcmToAudioBuffer = (
  pcmData: Uint8Array, 
  ctx: AudioContext, 
  sampleRate: number = 24000
): AudioBuffer => {
  // Convert Uint8Array to Int16Array (Raw PCM is usually 16-bit little-endian)
  const int16Array = new Int16Array(pcmData.buffer);
  
  const frameCount = int16Array.length;
  const audioBuffer = ctx.createBuffer(1, frameCount, sampleRate);
  const channelData = audioBuffer.getChannelData(0);

  for (let i = 0; i < frameCount; i++) {
    // Convert Int16 (-32768 to 32767) to Float32 (-1.0 to 1.0)
    channelData[i] = int16Array[i] / 32768.0;
  }

  return audioBuffer;
};

export const playAudioData = async (base64Audio: string) => {
  try {
    const ctx = getAudioContext();
    
    // Resume context if suspended (browser policy)
    if (ctx.state === 'suspended') {
      await ctx.resume();
    }

    const rawBytes = decodeBase64(base64Audio);
    
    // Gemini API returns raw PCM data, not a WAV/MP3 file with headers.
    // We must manually convert the raw PCM bytes into an AudioBuffer.
    const audioBuffer = pcmToAudioBuffer(rawBytes, ctx, 24000);

    const source = ctx.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(ctx.destination);
    source.start(0);
  } catch (error) {
    console.error("Failed to play audio", error);
  }
};