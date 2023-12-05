// Global Variable
const APIKEY_OPENWEATHER = "32b2a7c9028fc50e67a531e7f54cb096";
let geoLocationArr = JSON.parse(localStorage.getItem("city")) || [];

//#region functions
function renderHistory() {
  // DOM selector
  const historyDispEl = document.querySelector("#historyDisp");
  // Reset the list
  historyDispEl.innerHTML = "";

  // Loop through all the cities in the history(citiesObjArr)
  geoLocationArr.forEach((geoLocation, i) => {
    // Get the city name without spaces
    const cityName = geoLocation.name.split(" ").join("");

    // "Create" a <li> with a nested <a> and <button> element
    let htmlStr;

    if (geoLocation.zip) {
      htmlStr = `<li class="history-list">
      <a id="${cityName}-${i}" class="history-link">${geoLocation.name}, ${geoLocation.zip}</a>
      <button id="delete-${cityName}-${i}">Delete</button></li>`;
    } else {
      htmlStr = `<li class="history-list">
      <a id="${cityName}-${i}" class="history-link">${geoLocation.name}, ${geoLocation.state}</a>
      <button id="delete-${cityName}-${i}">Delete</button></li>`;
    }

    
    // "Append" the elements
    historyDispEl.insertAdjacentHTML("beforeend", htmlStr);

    // eventlistener for each <a> tag to display the weather data of that city
    document
      .querySelector(`#${cityName}-${i}`)
      .addEventListener("click", () => {
        // Get the weather information for the city
        const { lat, lon } = geoLocation;
        getWeatherData(lat, lon);
      });

    // eventListener for the delete button for the city
    const deleteBtn = document.querySelector(`#delete-${cityName}-${i}`);

    deleteBtn.addEventListener("click", () => {
      // Remove the parent li element
      deleteBtn.parentElement.remove();
      // Delete the element from the array and update localStorage
      geoLocationArr.splice(i, 1);
      localStorage.setItem("city", JSON.stringify(geoLocationArr));
      // Re-render the list to match the index again
      renderHistory();
    });
  });
}

// Display the weather forcast data on the page
function renderForecastWeather(forecastWeatherData) {
  // DOM selectors
  const weatherForcastDispEl = document.querySelector("#forecastList");

  // Reset the list
  weatherForcastDispEl.innerHTML = "";
  // Loop through each day of the 5 days forcast
  for (let i = 0; i < forecastWeatherData.list.length; i += 8) {
    const dayObj = forecastWeatherData.list[i];
    // Calculate the time of the API call
    const calTime = dayjs.unix(dayObj.dt).format(`(M/D/YYYY)`);

    // "Create" a li element for each day of the forcast
    const htmlStr = `<li class="card bg-dark text-white" style="width: 18rem">
  <div class="card-body">
    <h5 class="card-title">${calTime}</h5>
    <p class="card-text">Temp: ${dayObj.main.temp}°F</p>
    <p class="card-text">Wind: ${dayObj.wind.speed} MPH</p>
    <p class="card-text">Humidity: ${dayObj.main.humidity} %</p>
  </div></li>`;
    // "append" the crated li element to the list
    weatherForcastDispEl.innerHTML += htmlStr;
  }
}

// Display the current weather data on the page
function renderCurrentWeather(currentWeatherData) {
  // DOM selectors
  const currentDispEl = document.querySelector("#currentDisp");

  // Calculate time and icon url
  const calDate = dayjs.unix(currentWeatherData.dt).format(`(M/D/YYYY)`);
  const iconUrl = `https://openweathermap.org/img/wn/${currentWeatherData.weather[0].icon}@2x.png`;

  // "Create" html elements
  const htmlStr = `<h2 class="row align-center">${currentWeatherData.name} ${calDate} <i class="icon"><img src="${iconUrl}" style="width: 4em"></i></h2>
  <p>Temp: ${currentWeatherData.main.temp}°F</p>
  <p>Wind: ${currentWeatherData.wind.speed} MP</p>
  <p>Humidity: ${currentWeatherData.main.humidity} %</p>`;
  // "append" html elements
  currentDispEl.innerHTML += htmlStr; 
}

// get weather for the current city and display
async function getWeatherData(lat, lon) {
  // API call for current weather data
  const currentAPIurl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${APIKEY_OPENWEATHER}&units=imperial`;

  let response = await fetch(currentAPIurl);
  const currentWeatherData = await response.json();

  // API call for forecast weather data
  const forecastAPIurl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${APIKEY_OPENWEATHER}&units=imperial`;

  response = await fetch(forecastAPIurl);
  const forecastWeatherData = await response.json();

  // Show the weather information display on the right
  document.querySelector("section").classList.remove("d-none");
  // Display the weather data on the page
  renderCurrentWeather(currentWeatherData);
  renderForecastWeather(forecastWeatherData);
}

// API call for city geo location
async function getGeoLocation(geoAPIurl) {
  try {
    const response = await fetch(geoAPIurl);
    const data = await response.json();

    // If the returned response is an empty array i.e. not a valid city, throw an error
    if (data.length === 0) {
      throw new Error("Empty array");
    }

    // geoLocation is an arry if user input city name, an object if zipcode
    const geoLocation = data[0] || data;

    // add city to history list and save to localstorage
    geoLocationArr.push(geoLocation);
    localStorage.setItem("city", JSON.stringify(geoLocationArr));
    renderHistory();

    // Get the current and weather forcast data
    const { lat, lon } = geoLocation;
    getWeatherData(lat, lon);

    // Catch the thrown errors
  } catch (error) {
    console.log(error);
    alert('Invalid city! \n\nPlease try again.');
  }
}

// Create the url for the openWeather Geo API
function generateGeoUrl(inputObj) {
  const {cityName, stateCode, zipCode, countryCode: countryCode = 'US' } = inputObj;
  let geoAPIurl = '';

  if (zipCode) {
    geoAPIurl = `https://api.openweathermap.org/geo/1.0/zip?zip=${zipCode},${countryCode}&appid=${APIKEY_OPENWEATHER}`;

    // normal with city name and state code
  } else if (cityName) {
    geoAPIurl = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName},${stateCode},${countryCode}&limit=1&appid=${APIKEY_OPENWEATHER}`;
  }

  console.log(geoAPIurl)

  getGeoLocation(geoAPIurl);
}
//#endregion functions

//#region eventListeners
document
  .querySelector("#userInput")
  .addEventListener("submit", async (event) => {
    // Stop default form action
    event.preventDefault();

    // DOM selector
    const cityInputEl = document.querySelector("#cityInput");

    // Get user input and reset the field
    const userInput = cityInputEl.value.trim();
    cityInputEl.value = "";

    // exit out of the function if user dind't put in a city name
    if (!userInput) {
      alert("Please type in a city name");
      return;
    }
    
    // Convert userinput into an object data
    const inputObj = {};

    // If the user only put in a zip code: Long Beach, CA 90803
    if (isNaN(userInput)) {
      let tempArr = userInput.split(',');
      inputObj.cityName = tempArr.shift();

      tempArr = tempArr.join('').trim().split(' ');

      inputObj.stateCode = tempArr.shift();
      inputObj.zipCode = tempArr.shift();
      
      // If the user put in city name and state: 90803
    } else if (!isNaN(userInput) && userInput.length === 5) {
      inputObj.zipCode = userInput;

    } else {
      alert('Invalid zip code');
      return;
    }

    console.log(inputObj);

    // Get the geo location of the selected city
    generateGeoUrl(inputObj);
  });
//#endregion eventListeners

// Init on DOM ready
(onDOMContentLoaded = () => {
  renderHistory();
})();