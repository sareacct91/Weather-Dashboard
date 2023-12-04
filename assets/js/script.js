// Global Variable
const APIKEY_OPENWEATHER = "32b2a7c9028fc50e67a531e7f54cb096";
let citiesObjArr = JSON.parse(localStorage.getItem("city")) || [];

//#region functions
function renderHistory() {
  // DOM selector
  const historyDispEl = document.querySelector("#historyDisp");
  // Reset the list
  historyDispEl.innerHTML = "";

  // Loop through all the cities in the history(citiesObjArr)
  citiesObjArr.forEach((geoLocation, i) => {
    // Get the city name without spaces
    const cityName = geoLocation.name.split(" ").join("");

    // "Create" an <li> with a nested <a> element
    const htmlStr = `<li class="list-group-item">
    <a id="${cityName}-${i}" class="card-link">${geoLocation.name}</a>
    <button id="delete-${cityName}-${i}">Delete</button></li>`;
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
      citiesObjArr.splice(i, 1);
      localStorage.setItem("city", JSON.stringify(citiesObjArr));
      // Re-render the list to match the index again
      renderHistory();
    });
  });
}

// Display the current weather data on the page
function renderCurrentWeather(currentWeatherData) {
  // DOM selectors
  const currentDispEl = document.querySelector("#currentDisp");

  // Calculate time and icon url
  const calTime = dayjs.unix(currentWeatherData.dt).format(`(M/D/YYYY)`);
  const iconUrl = `https://openweathermap.org/img/wn/${currentWeatherData.weather[0].icon}@2x.png`;

  // "Create" html elements
  const htmlStr = `<h2>${currentWeatherData.name} ${calTime} <i class="icon"><img src="${iconUrl}"></i></h2>
  <p>Temp: ${currentWeatherData.main.temp}°F</p>
  <p>Wind: ${currentWeatherData.wind.speed} MP</p>
  <p>Humidity: ${currentWeatherData.main.humidity} %</p>`;
  // "append" html elements
  currentDispEl.innerHTML = htmlStr;
}

function renderForecastWeather(forecastWeatherData) {
  // DOM selectors
  const currentWeatherDispEl = document.querySelector("#forecastList");

  // Reset the list
  currentWeatherDispEl.innerHTML = "";
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
    currentWeatherDispEl.innerHTML += htmlStr;
  }
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
async function getGeoLocation(inputArr) {
  const [cityId, stateCode] = inputArr;
  let geoAPIurl = "";

  // check for zip code input
  if (!isNaN(cityId) && cityId.length === 5) {
    geoAPIurl = `http://api.openweathermap.org/geo/1.0/zip?zip=${cityId},US&appid=${APIKEY_OPENWEATHER}`;
    // normal with city name and state code
  } else if (isNaN(cityId)) {
    geoAPIurl = `http://api.openweathermap.org/geo/1.0/direct?q=${cityId}&limit=1&appid=${APIKEY_OPENWEATHER}`;
  }

  // Try catch block
  try {
    let response = await fetch(geoAPIurl);
    response = await response.json();
    // If the returned response is an empty array i.e. not a valid city, throw an error
    if (response.length === 0) {
      throw new Error("empty array");
    }
    // return response if everything is good
    return response;
  } catch (error) {
    console.log(error);
    return "error";
  }
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

    // exit out of the function if user dind't put in a city name
    if (!cityInputEl.value) {
      alert("Please type in a city name");
      return;
    }
    // Get user input and reset the input field
    const inputArr = cityInputEl.value.trime().split(", ");
    cityInputEl.value = "";

    // Get the geo location of the selected city
    let geoLocation = await getGeoLocation(inputArr);

    // Error checking for geo data
    if (geoLocation === "error") {
      alert("Please input a valid city name or US zipcode");
      return;
    } else {
      // geoLocation is an arry if user input city name, an object if zipcode
      geoLocation = geoLocation[0] || geoLocation;
    }

    // Get the lat and lon from geoLocation data
    const { lat, lon } = geoLocation;
    // Get the weather information using lat and lon
    getWeatherData(lat, lon);

    // add city to history list and save to localstorage
    citiesObjArr.push(geoLocation);
    localStorage.setItem("city", JSON.stringify(citiesObjArr));
    renderHistory();
  });
//#endregion eventListeners

// Init on DOM ready
(onDOMContentLoaded = () => {
  renderHistory();
})();
