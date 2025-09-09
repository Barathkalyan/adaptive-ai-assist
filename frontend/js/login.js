document.addEventListener('DOMContentLoaded', () => {
  const synth = window.speechSynthesis;
  let accessibilityMode = null;

  const speak = (text) => {
    if (synth.speaking) synth.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    synth.speak(utterance);
  };

  // Auto TTS for blind users on page load
  speak('Welcome! Press 1 for Blind, 2 for Deaf, 3 for Mute, 4 for Multiple.');

  // Accessibility mode selection
  const buttons = {
    'blind-mode': 'blind',
    'deaf-mode': 'deaf',
    'mute-mode': 'mute',
    'multiple-mode': 'multiple'
  };

  Object.keys(buttons).forEach(id => {
    const btn = document.getElementById(id);
    btn.addEventListener('click', () => {
      accessibilityMode = buttons[id];
      console.log(`Accessibility mode set to: ${accessibilityMode}`);
      document.getElementById('phone-input').focus();

      if (accessibilityMode === 'blind') {
        speak(`Accessibility mode set to Blind. You can speak your phone number now. Press Enter when done.`);
        startVoiceInput();
      }
      if (accessibilityMode === 'deaf') navigator.vibrate?.([200,100,200]);
    });
  });

  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    const keyMap = { '1':'blind-mode', '2':'deaf-mode', '3':'mute-mode', '4':'multiple-mode' };
    if (keyMap[e.key]) document.getElementById(keyMap[e.key]).click();
    if (e.key === 'Enter' && document.activeElement === document.getElementById('phone-input')) {
      document.getElementById('otp-login').click();
    }
  });

  // Voice input function
  function startVoiceInput() {
    if (!('webkitSpeechRecognition' in window)) return;
    const recognition = new webkitSpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      let transcript = event.results[0][0].transcript;
      // Keep only digits
      transcript = transcript.replace(/\D/g, '');
      if (transcript.length === 0) {
        speak('No digits detected. Please try again.');
        recognition.start(); // repeat
        return;
      }

      document.getElementById('phone-input').value = transcript;

      // Speak digits one by one
      const digits = transcript.split('').join(' ');
      speak(`You entered: ${digits}. Say "repeat" to try again or press Enter to continue.`);

      // Optional: listen for "repeat" command
      recognition.onend = () => {
        // After speech ends, allow user to press Enter or speak "repeat"
        const repeatListener = new webkitSpeechRecognition();
        repeatListener.lang = 'en-US';
        repeatListener.interimResults = false;
        repeatListener.maxAlternatives = 1;
        repeatListener.onresult = (ev) => {
          const cmd = ev.results[0][0].transcript.toLowerCase();
          if (cmd.includes('repeat')) {
            speak('Okay, please speak your phone number again.');
            startVoiceInput();
          }
        };
        repeatListener.start();
      };
    };

    recognition.onerror = (event) => {
      console.error('Voice recognition error:', event.error);
      speak('Voice input failed. Please enter your phone number manually.');
    };

    recognition.start();
  }

  // OTP login
  document.getElementById('otp-login').addEventListener('click', () => {
    const phone = document.getElementById('phone-input').value.trim();
    if (phone) {
      console.log(`Sending OTP to ${phone}`);
      if (accessibilityMode === 'blind') speak(`Sending OTP to ${phone}. Please wait.`);
      if (accessibilityMode === 'deaf') navigator.vibrate?.([200, 100, 200]);
      // TODO: Integrate with backend OTP
      console.log('Redirecting to dashboard (mock)');
    } else {
      if (accessibilityMode === 'blind') speak('Please enter a valid phone number.');
      alert('Please enter a valid phone number.');
    }
  });

  // Guest login
  document.getElementById('guest-login').addEventListener('click', () => {
    console.log('Continuing as guest');
    if (accessibilityMode === 'blind') speak('Continuing as guest. Redirecting to dashboard.');
    if (accessibilityMode === 'deaf') navigator.vibrate?.([200, 100, 200]);
    console.log('Redirecting to dashboard (mock)');
  });
});
