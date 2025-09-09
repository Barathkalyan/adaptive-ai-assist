document.addEventListener('DOMContentLoaded', () => {
  const synth = window.speechSynthesis;
  let accessibilityMode = null;
  let voiceActive = false;

  const speak = (text) => {
    if (synth.speaking) synth.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    synth.speak(utterance);
  };

  // Auto TTS on page load
  speak('Welcome! Press 1 for Blind, 2 for Deaf, 3 for Mute, 4 for Multiple.');

  // Accessibility mode buttons
  const buttons = {
    'blind-mode': 'blind',
    'deaf-mode': 'deaf',
    'mute-mode': 'mute',
    'multiple-mode': 'multiple'
  };

  Object.keys(buttons).forEach(id => {
    document.getElementById(id).addEventListener('click', () => {
      accessibilityMode = buttons[id];
      const inputField = document.getElementById('phone-input');
      inputField.value = '';
      inputField.focus();

      if (accessibilityMode === 'blind' && !voiceActive) {
        speak('Blind mode activated. Please speak your phone number after the beep.');
        setTimeout(() => startVoiceInput(inputField), 500); // small delay ensures input is ready
      }
      if (accessibilityMode === 'deaf') navigator.vibrate?.([200,100,200]);
    });
  });

  // Keyboard shortcuts for mode selection
  document.addEventListener('keydown', (e) => {
    const keyMap = { '1':'blind-mode', '2':'deaf-mode', '3':'mute-mode', '4':'multiple-mode' };
    if (keyMap[e.key]) {
      e.preventDefault(); // prevent key from entering input
      document.getElementById(keyMap[e.key]).click();
    }
    if (e.key === 'Enter' && document.activeElement === document.getElementById('phone-input')) {
      document.getElementById('otp-login').click();
    }
  });

  // Convert spoken words to digits
  const wordsToDigits = (text) => {
    const map = {
      'zero':'0','one':'1','two':'2','three':'3','four':'4',
      'five':'5','six':'6','seven':'7','eight':'8','nine':'9'
    };
    return text.toLowerCase()
      .split(/[\s-]+/)
      .map(word => map[word] ?? word.replace(/\D/g,''))
      .join('')
      .replace(/\D/g,'');
  };

  // Convert number string to natural spoken number
  const numberToWords = (num) => {
    try {
      return Number(num).toLocaleString('en-US', { maximumFractionDigits: 0 });
    } catch {
      return num.split('').join(' '); // fallback
    }
  };

  // Voice input for blind users
  function startVoiceInput(inputField) {
    if (!('webkitSpeechRecognition' in window)) {
      speak('Voice input not supported in this browser.');
      return;
    }

    voiceActive = true;

    const recognition = new webkitSpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      let transcript = event.results[0][0].transcript.toLowerCase();

      if (transcript.includes('repeat')) {
        inputField.value = '';
        speak('Okay, please speak your phone number again.');
        recognition.start();
        return;
      }
      if (transcript.includes('clear all')) {
        inputField.value = '';
        speak('Phone number cleared. Please speak again.');
        recognition.start();
        return;
      }
      if (transcript.includes('delete last')) {
        inputField.value = inputField.value.slice(0, -1);
        speak(`Last digit removed. Current number: ${numberToWords(inputField.value)}`);
        recognition.start();
        return;
      }

      const digits = wordsToDigits(transcript);
      if (!digits) {
        speak('No digits detected. Please try again.');
        recognition.start();
        return;
      }

      // Ensure inputField updates after recognition
      setTimeout(() => {
        inputField.value = digits;
        speak(`You entered: ${numberToWords(digits)}. Press Enter to continue or say repeat to try again.`);
      }, 100);
    };

    recognition.onerror = (event) => {
      console.error('Voice recognition error:', event.error);
      speak('Voice input failed. Please enter your phone number manually.');
    };

    recognition.onend = () => {
      voiceActive = false;
    };

    recognition.start();
  }

  // OTP login
  document.getElementById('otp-login').addEventListener('click', () => {
    const phone = document.getElementById('phone-input').value.trim();
    if (phone) {
      console.log(`Sending OTP to ${phone}`);
      if (accessibilityMode === 'blind') speak(`Sending OTP to ${numberToWords(phone)}. Please wait.`);
      if (accessibilityMode === 'deaf') navigator.vibrate?.([200,100,200]);
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
    if (accessibilityMode === 'deaf') navigator.vibrate?.([200,100,200]);
    console.log('Redirecting to dashboard (mock)');
  });
});
