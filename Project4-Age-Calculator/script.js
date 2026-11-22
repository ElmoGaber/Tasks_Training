(function () {
  const birthdateInput = document.getElementById('birthdateInput');
  const calculateBtn = document.getElementById('calculateBtn');
  const errorMsg = document.getElementById('errorMsg');
  const results = document.getElementById('results');
  const yearsEl = document.getElementById('years');
  const monthsEl = document.getElementById('months');
  const daysEl = document.getElementById('days');
  const totalDaysEl = document.getElementById('totalDays');
  const nextBirthdayEl = document.getElementById('nextBirthday');
  const daysUntilBirthdayEl = document.getElementById('daysUntilBirthday');
  const zodiacSignEl = document.getElementById('zodiacSign');

  const today = new Date();
  const maxDate = today.toISOString().split('T')[0];
  birthdateInput.setAttribute('max', maxDate);

  function validateInput(dateStr) {
    if (!dateStr) {
      return 'Please enter your date of birth.';
    }
    const date = new Date(dateStr + 'T00:00:00');
    if (isNaN(date.getTime())) {
      return 'Please enter a valid date.';
    }
    if (date > today) {
      return 'Date of birth cannot be in the future.';
    }
    const earliest = new Date('1900-01-01T00:00:00');
    if (date < earliest) {
      return 'Date must be after January 1, 1900.';
    }
    return '';
  }

  function calculateAge(birthStr) {
    const birth = new Date(birthStr + 'T00:00:00');
    const now = new Date();

    let years = now.getFullYear() - birth.getFullYear();
    let months = now.getMonth() - birth.getMonth();
    let days = now.getDate() - birth.getDate();

    if (days < 0) {
      months--;
      const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
      days += prevMonth.getDate();
    }

    if (months < 0) {
      years--;
      months += 12;
    }

    return { years, months, days };
  }

  function getTotalDays(birthStr) {
    const birth = new Date(birthStr + 'T00:00:00');
    const now = new Date();
    const diff = now.getTime() - birth.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  }

  function getNextBirthday(birthStr) {
    const birth = new Date(birthStr + 'T00:00:00');
    const now = new Date();

    let year = now.getFullYear();
    let month = birth.getMonth();
    let day = birth.getDate();

    if (month === 1 && day === 29 && !isLeapYear(year)) {
      day = 28;
    }

    let next = new Date(year, month, day);

    if (next <= now) {
      year++;
      if (month === 1 && day === 28 && birth.getDate() === 29 && !isLeapYear(year)) {
        day = 28;
      }
      next = new Date(year, month, day);
    }

    const daysUntil = Math.ceil((next.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const formatted = next.toLocaleDateString('en-US', options);

    return { date: formatted, daysUntil };
  }

  function isLeapYear(year) {
    return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
  }

  function getZodiacSign(month, day) {
    const signs = [
      { name: 'Capricorn', start: [12, 22], end: [1, 19] },
      { name: 'Aquarius', start: [1, 20], end: [2, 18] },
      { name: 'Pisces', start: [2, 19], end: [3, 20] },
      { name: 'Aries', start: [3, 21], end: [4, 19] },
      { name: 'Taurus', start: [4, 20], end: [5, 20] },
      { name: 'Gemini', start: [5, 21], end: [6, 20] },
      { name: 'Cancer', start: [6, 21], end: [7, 22] },
      { name: 'Leo', start: [7, 23], end: [8, 22] },
      { name: 'Virgo', start: [8, 23], end: [9, 22] },
      { name: 'Libra', start: [9, 23], end: [10, 22] },
      { name: 'Scorpio', start: [10, 23], end: [11, 21] },
      { name: 'Sagittarius', start: [11, 22], end: [12, 21] }
    ];

    const m = month + 1;
    const d = day;

    for (const sign of signs) {
      if (sign.name === 'Capricorn') {
        if ((m === 12 && d >= 22) || (m === 1 && d <= 19)) return sign.name;
      } else if (sign.start[0] === m && d >= sign.start[1]) {
        return sign.name;
      } else if (sign.end[0] === m && d <= sign.end[1]) {
        return sign.name;
      }
    }
    return 'Capricorn';
  }

  function updateResults(dateStr) {
    const birth = new Date(dateStr + 'T00:00:00');
    const age = calculateAge(dateStr);
    const totalDays = getTotalDays(dateStr);
    const nextBirthday = getNextBirthday(dateStr);
    const zodiac = getZodiacSign(birth.getMonth(), birth.getDate());

    yearsEl.textContent = age.years;
    monthsEl.textContent = age.months;
    daysEl.textContent = age.days;
    totalDaysEl.textContent = totalDays.toLocaleString();
    nextBirthdayEl.textContent = nextBirthday.date;
    daysUntilBirthdayEl.textContent = nextBirthday.daysUntil + ' days';
    zodiacSignEl.textContent = zodiac;

    results.hidden = false;
  }

  function handleCalculate() {
    const dateStr = birthdateInput.value;
    const error = validateInput(dateStr);

    if (error) {
      errorMsg.textContent = error;
      results.hidden = true;
      return;
    }

    errorMsg.textContent = '';
    updateResults(dateStr);
  }

  calculateBtn.addEventListener('click', handleCalculate);

  birthdateInput.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleCalculate();
    }
  });

  if (birthdateInput.value) {
    const error = validateInput(birthdateInput.value);
    if (!error) {
      updateResults(birthdateInput.value);
    }
  }
})();
