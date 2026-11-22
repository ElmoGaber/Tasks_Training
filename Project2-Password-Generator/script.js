(function () {
  const passwordOutput = document.getElementById('passwordOutput');
  const copyBtn = document.getElementById('copyBtn');
  const lengthSlider = document.getElementById('lengthSlider');
  const lengthValue = document.getElementById('lengthValue');
  const generateBtn = document.getElementById('generateBtn');
  const strengthFill = document.getElementById('strengthFill');
  const strengthLabel = document.getElementById('strengthLabel');
  const uppercaseCheck = document.getElementById('uppercase');
  const lowercaseCheck = document.getElementById('lowercase');
  const numbersCheck = document.getElementById('numbers');
  const symbolsCheck = document.getElementById('symbols');

  const UPPERCASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const LOWERCASE = 'abcdefghijklmnopqrstuvwxyz';
  const NUMBERS = '0123456789';
  const SYMBOLS = '!@#$%^&*()_+-=[]{}|;:,.<>?';

  function getCharacterPool() {
    let pool = '';
    if (uppercaseCheck.checked) pool += UPPERCASE;
    if (lowercaseCheck.checked) pool += LOWERCASE;
    if (numbersCheck.checked) pool += NUMBERS;
    if (symbolsCheck.checked) pool += SYMBOLS;
    return pool;
  }

  function getRandomChar(characters) {
    const index = crypto.getRandomValues(new Uint32Array(1))[0] % characters.length;
    return characters[index];
  }

  function generatePassword() {
    const length = parseInt(lengthSlider.value, 10);
    const pool = getCharacterPool();

    if (pool.length === 0) {
      passwordOutput.value = 'Select at least one option';
      updateStrength(0);
      return;
    }

    const passwordArray = [];

    if (uppercaseCheck.checked) {
      passwordArray.push(getRandomChar(UPPERCASE));
    }
    if (lowercaseCheck.checked) {
      passwordArray.push(getRandomChar(LOWERCASE));
    }
    if (numbersCheck.checked) {
      passwordArray.push(getRandomChar(NUMBERS));
    }
    if (symbolsCheck.checked) {
      passwordArray.push(getRandomChar(SYMBOLS));
    }

    for (let i = passwordArray.length; i < length; i++) {
      passwordArray.push(getRandomChar(pool));
    }

    shuffleArray(passwordArray);

    passwordOutput.value = passwordArray.join('');
    updateStrength(length);
  }

  function shuffleArray(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = crypto.getRandomValues(new Uint32Array(1))[0] % (i + 1);
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  }

  function updateStrength(length) {
    const checks = [
      uppercaseCheck.checked,
      lowercaseCheck.checked,
      numbersCheck.checked,
      symbolsCheck.checked
    ];
    const checkedCount = checks.filter(Boolean).length;

    let score = 0;
    score += Math.min(length * 4, 40);
    score += checkedCount * 15;

    if (length >= 8) score += 10;
    if (length >= 12) score += 10;
    if (length >= 16) score += 10;
    if (checkedCount >= 3 && length >= 8) score += 10;
    if (checkedCount === 4 && length >= 12) score += 5;

    score = Math.min(score, 100);

    let color, label;
    if (score < 25) {
      color = '#da3633';
      label = 'Weak';
    } else if (score < 50) {
      color = '#d29922';
      label = 'Medium';
    } else if (score < 75) {
      color = '#2ea043';
      label = 'Strong';
    } else {
      color = '#1f6feb';
      label = 'Very Strong';
    }

    strengthFill.style.width = score + '%';
    strengthFill.style.background = color;
    strengthLabel.textContent = label;
    strengthLabel.style.color = color;
  }

  function copyToClipboard() {
    const text = passwordOutput.value;
    if (!text || text === 'Select at least one option') return;

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () {
        showCopyFeedback();
      });
    } else {
      passwordOutput.select();
      document.execCommand('copy');
      showCopyFeedback();
    }
  }

  function showCopyFeedback() {
    copyBtn.classList.add('copied');
    const originalHtml = copyBtn.innerHTML;
    copyBtn.innerHTML =
      '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>';

    setTimeout(function () {
      copyBtn.classList.remove('copied');
      copyBtn.innerHTML = originalHtml;
    }, 1500);
  }

  lengthSlider.addEventListener('input', function () {
    lengthValue.textContent = lengthSlider.value;
    generatePassword();
  });

  uppercaseCheck.addEventListener('change', generatePassword);
  lowercaseCheck.addEventListener('change', generatePassword);
  numbersCheck.addEventListener('change', generatePassword);
  symbolsCheck.addEventListener('change', generatePassword);

  generateBtn.addEventListener('click', generatePassword);
  copyBtn.addEventListener('click', copyToClipboard);

  generatePassword();
})();
