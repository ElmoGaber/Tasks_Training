(function () {
  const display = document.getElementById('display');
  const expressionEl = document.getElementById('expression');
  const buttons = document.querySelector('.buttons');

  let currentInput = '0';
  let previousInput = '';
  let operator = null;
  let shouldResetDisplay = false;
  let lastOperand = null;
  let lastOperator = null;

  function updateDisplay() {
    display.textContent = currentInput;
    if (currentInput.length > 12) {
      display.classList.add('small');
    } else {
      display.classList.remove('small');
    }
  }

  function updateExpression() {
    if (operator && previousInput) {
      const opSymbol = getOperatorSymbol(operator);
      expressionEl.textContent = `${previousInput} ${opSymbol}`;
    } else {
      expressionEl.textContent = '';
    }
  }

  function getOperatorSymbol(op) {
    const map = { '+': '+', '-': '\u2212', '*': '\u00D7', '/': '\u00F7' };
    return map[op] || op;
  }

  function inputNumber(value) {
    if (shouldResetDisplay) {
      currentInput = value === '.' ? '0.' : value;
      shouldResetDisplay = false;
    } else {
      if (value === '.' && currentInput.includes('.')) return;
      if (currentInput === '0' && value !== '.') {
        currentInput = value;
      } else {
        currentInput += value;
      }
    }
    updateDisplay();
    updateExpression();
  }

  function inputOperator(op) {
    if (operator && !shouldResetDisplay) {
      calculate();
    } else if (operator && shouldResetDisplay && lastResultExists()) {
      previousInput = currentInput;
    }
    previousInput = currentInput;
    operator = op;
    shouldResetDisplay = true;
    updateExpression();
  }

  function lastResultExists() {
    return lastOperand !== null && lastOperator !== null;
  }

  function calculate() {
    if (!operator && !lastOperator) return;
    if (!operator && lastOperator) {
      repeatLastOperation();
      return;
    }
    if (!previousInput) return;

    const prev = parseFloat(previousInput);
    const curr = parseFloat(currentInput);

    if (Number.isNaN(prev) || Number.isNaN(curr)) {
      showError('Error');
      return;
    }

    let result = compute(prev, curr, operator);
    if (result === null) return;

    lastOperand = curr;
    lastOperator = operator;

    currentInput = formatResult(result);
    previousInput = '';
    operator = null;
    shouldResetDisplay = true;
    updateDisplay();
    expressionEl.textContent = '';
  }

  function repeatLastOperation() {
    const curr = parseFloat(currentInput);
    if (Number.isNaN(curr)) return;

    let result = compute(curr, lastOperand, lastOperator);
    if (result === null) return;

    currentInput = formatResult(result);
    shouldResetDisplay = true;
    updateDisplay();
    expressionEl.textContent = '';
  }

  function compute(a, b, op) {
    let result;
    switch (op) {
      case '+': result = a + b; break;
      case '-': result = a - b; break;
      case '*': result = a * b; break;
      case '/':
        if (b === 0) {
          showError('Cannot divide by zero');
          return null;
        }
        result = a / b;
        break;
      default: return null;
    }
    if (!isFinite(result)) {
      showError('Error');
      return null;
    }
    return result;
  }

  function formatResult(num) {
    const str = num.toString();
    if (str.length <= 15) return str;
    return num.toExponential(6);
  }

  function showError(msg) {
    currentInput = msg;
    previousInput = '';
    operator = null;
    shouldResetDisplay = true;
    lastOperand = null;
    lastOperator = null;
    display.textContent = msg;
    display.classList.add('small');
    expressionEl.textContent = '';
  }

  function clearAll() {
    currentInput = '0';
    previousInput = '';
    operator = null;
    shouldResetDisplay = false;
    lastOperand = null;
    lastOperator = null;
    display.classList.remove('small');
    updateDisplay();
    expressionEl.textContent = '';
  }

  function deleteLast() {
    if (currentInput === 'Error' || currentInput === 'Cannot divide by zero') {
      clearAll();
      return;
    }
    if (shouldResetDisplay) return;
    if (currentInput.length <= 1) {
      currentInput = '0';
    } else {
      currentInput = currentInput.slice(0, -1);
    }
    updateDisplay();
  }

  function inputPercent() {
    const num = parseFloat(currentInput);
    if (Number.isNaN(num)) return;
    currentInput = formatResult(num / 100);
    updateDisplay();
  }

  function handleButtonClick(value) {
    if (display.textContent === 'Error' || display.textContent === 'Cannot divide by zero') {
      if (value === 'C') {
        clearAll();
        return;
      }
    }

    if (value >= '0' && value <= '9') {
      inputNumber(value);
    } else if (value === '.') {
      inputNumber(value);
    } else if (value === '+' || value === '-' || value === '*' || value === '/') {
      inputOperator(value);
    } else if (value === '=') {
      calculate();
    } else if (value === 'C') {
      clearAll();
    } else if (value === 'DEL') {
      deleteLast();
    } else if (value === '%') {
      inputPercent();
    }
  }

  buttons.addEventListener('click', function (e) {
    const btn = e.target.closest('.btn');
    if (!btn) return;
    const value = btn.getAttribute('data-value');
    handleButtonClick(value);
  });

  document.addEventListener('keydown', function (e) {
    const key = e.key;

    if (key >= '0' && key <= '9') {
      e.preventDefault();
      handleButtonClick(key);
    } else if (key === '.') {
      e.preventDefault();
      handleButtonClick('.');
    } else if (key === '+') {
      e.preventDefault();
      handleButtonClick('+');
    } else if (key === '-') {
      e.preventDefault();
      handleButtonClick('-');
    } else if (key === '*') {
      e.preventDefault();
      handleButtonClick('*');
    } else if (key === '/') {
      e.preventDefault();
      handleButtonClick('/');
    } else if (key === 'Enter' || key === '=') {
      e.preventDefault();
      handleButtonClick('=');
    } else if (key === 'Backspace') {
      e.preventDefault();
      handleButtonClick('DEL');
    } else if (key === 'Escape' || key === 'c' || key === 'C') {
      e.preventDefault();
      handleButtonClick('C');
    } else if (key === '%') {
      e.preventDefault();
      handleButtonClick('%');
    }
  });
})();
