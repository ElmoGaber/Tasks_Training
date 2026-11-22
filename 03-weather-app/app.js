// Weather App - Get weather information for a city
document.addEventListener('DOMContentLoaded', () => {
    const cityInput = document.getElementById('city-input');
    const searchBtn = document.getElementById('search-btn');
    const weatherDisplay = document.getElementById('weather-display');
    const errorDisplay = document.getElementById('error');
    
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
});