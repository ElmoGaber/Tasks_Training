// Weather App - Get weather information for a city with dark mode
document.addEventListener('DOMContentLoaded', () => {
    const cityInput = document.getElementById('city-input');
    const searchBtn = document.getElementById('search-btn');
    const weatherDisplay = document.getElementById('weather-display');
    const errorDisplay = document.getElementById('error');
    const themeToggle = document.querySelector('.theme-toggle');
    const themeIcon = document.getElementById('themeIcon');
    
    // Mock weather data for common cities
    const mockWeatherData = {
        'cairo': {
            temp: '28°C',
            description: 'Sunny',
            humidity: '60%',
            wind: '10 km/h'
        },
        'london': {
            temp: '15°C',
            description: 'Cloudy',
            humidity: '75%',
            wind: '15 km/h'
        },
        'new york': {
            temp: '22°C',
            description: 'Partly Cloudy',
            humidity: '55%',
            wind: '8 km/h'
        },
        'dubai': {
            temp: '35°C',
            description: 'Clear',
            humidity: '50%',
            wind: '12 km/h'
        },
        'paris': {
            temp: '20°C',
            description: 'Rainy',
            humidity: '80%',
            wind: '11 km/h'
        }
    };
    
    // Set initial theme
    function setInitialTheme() {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            document.body.classList.toggle('dark', savedTheme === 'dark');
        } else {
            // Use system preference
            const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
            document.body.classList.toggle('dark', prefersDarkScheme.matches);
        }
        updateThemeIcon();
    }
    
    // Update theme icon based on current theme
    function updateThemeIcon() {
        if (document.body.classList.contains('dark')) {
            themeIcon.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M20.285 21.285a1.975 1.975 0 0 1-2.828 0l-8.408-8.398-8.398 8.408a1.975 1.975 0 0 1-2.828-2.828l8.576-8.575 8.576 8.575a1.975 1.975 0 0 1 0 2.828zM5.216 5.216a4.001 4.001 0 0 0 0 5.657l5.35 5.35a4.001 4.001 0 0 0 5.657 0l5.351-5.35a4.001 4.001 0 0 0-5.657-5.657l-5.35 5.351zm10.688-2.227a3.997 3.997 0 0 1 0 5.655l-5.351 5.35a3.997 3.997 0 0 1-5.657 0l-5.351-5.35a3.997 3.997 0 0 1 5.657 0z"/></svg>';
        } else {
            themeIcon.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M20.285 21.285a1.975 1.975 0 0 1-2.828 0l-8.408-8.398-8.398 8.408a1.975 1.975 0 0 1-2.828-2.828l8.576-8.575 8.576 8.575a1.975 1.975 0 0 1 0 2.828zM5.216 5.216a4.001 4.001 0 0 0 0 5.657l5.35 5.35a4.001 4.001 0 0 0 5.657 0l5.351-5.35a4.001 4.001 0 0 0-5.657-5.657l-5.35 5.351zm10.688-2.227a3.997 3.997 0 0 1 0 5.655l-5.351 5.35a3.997 3.997 0 0 1-5.657 0l-5.351-5.35a3.997 3.997 0 0 1 5.657 0z"/></svg>';
        }
    }
    
    // Toggle theme
    function toggleTheme() {
        document.body.classList.toggle('dark');
        localStorage.setItem('theme', document.body.classList.contains('dark') ? 'dark' : 'light');
        updateThemeIcon();
    }
    
    // Event listener for theme toggle
    themeToggle.addEventListener('click', toggleTheme);
    
    // Also listen for system theme changes
    const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
    prefersDarkScheme.addEventListener('change', (e) => {
        if (!localStorage.getItem('theme')) {
            document.body.classList.toggle('dark', e.matches);
            updateThemeIcon();
        }
    });
    
    function showError(message) {
        errorDisplay.textContent = message;
        errorDisplay.classList.remove('hidden');
        weatherDisplay.classList.add('hidden');
    }
    
    function hideError() {
        errorDisplay.classList.add('hidden');
    }
    
    function showWeather(city, data) {
        const cityNameEl = document.getElementById('city-name');
        const temperatureEl = document.getElementById('temperature');
        const descriptionEl = document.getElementById('description');
        const humidityEl = document.getElementById('humidity');
        const windEl = document.getElementById('wind');
        
        cityNameEl.textContent = `${city}, Egypt`; // Simplified - in real app would use user's input
        temperatureEl.textContent = data.temp;
        descriptionEl.textContent = data.description;
        humidityEl.textContent = data.humidity;
        windEl.textContent = data.wind;
        
        weatherDisplay.classList.remove('hidden');
    }
    
    function fetchWeather(city) {
        const normalizedCity = city.toLowerCase().trim();
        
        // Check mock data first
        if (mockWeatherData[normalizedCity]) {
            showWeather(city, mockWeatherData[normalizedCity]);
            hideError();
            return;
        }
        
        // In a real app, we would fetch from a weather API here
        showError(`Weather data not available for "${city}". This is a demo app.`);
    }
    
    searchBtn.addEventListener('click', () => {
        const city = cityInput.value;
        if (!city) {
            showError('Please enter a city name');
            return;
        }
        fetchWeather(city);
    });
    
    // Allow pressing Enter in the input field
    cityInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            searchBtn.click();
        }
    });
    
    // Initialize
    setInitialTheme();
});