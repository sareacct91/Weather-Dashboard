//#region Global
const APIKEY_OPENWEATHER = "32b2a7c9028fc50e67a531e7f54cb096";

const ForecastListEl = document.querySelector("#ForecastList");
let citiesObjArr = JSON.parse(localStorage.getItem("city")) || [];
//#endregion Global

//#region functions
function displayHistory() {}

function displayCurrentWeather(currentWeather) {
  document.querySelector("section").classList.toggle("d-none");
  const currentWeatherDispEl = document.querySelector("#currentDisp");
  const h1El = currentWeatherDispEl.children[0];
  const tempEl = currentWeatherDispEl.children[1];
  const windEl = currentWeatherDispEl.children[2];
  const HumidityEl = currentWeatherDispEl.children[3];

  console.log(currentWeather);
  const calTime = dayjs.unix(currentWeather.dt).format(`(M/D/YYYY)`);
  const iconUrl = `https://openweathermap.org/img/wn/${currentWeather.weather[0].icon}@2x.png`;

  h1El.textContent = `${currentWeather.name} ${calTime} `;
  h1El.innerHTML += `<i class="icon"><img src="${iconUrl}"></i>`;

  tempEl.textContent += ` ${currentWeather.main.temp}°F`;
  windEl.textContent += ` ${currentWeather.wind.speed} MPH`;
  HumidityEl.textContent += ` ${currentWeather.main.humidity} %`;
}

// API call for city geo location
async function getGeoLocation(inputArr) {
  const [cityId, stateCode] = inputArr;
  let geoAPIurl = "";

  // check for zip code input
  if (!isNaN(cityId) && cityId.length === 5) {
    geoAPIurl = `http://api.openweathermap.org/geo/1.0/zip?zip=${cityId}&appid=${APIKEY}`;
    // normal with city name and state code
  } else {
    geoAPIurl = `http://api.openweathermap.org/geo/1.0/direct?q=${cityId},${stateCode},US&limit=1&appid=${APIKEY_OPENWEATHER}`;
  }

  let response = await fetch(geoAPIurl);
  return await response.json();
}

// get weather for the current city and display
async function getCurrentWeather(geoLocation) {
  let { lat, lon } = geoLocation[0];
  // API call for current weather data
  const currentAPIurl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${APIKEY_OPENWEATHER}&units=imperial`;

  response = await fetch(currentAPIurl);
  const currentWeather = await response.json();

  displayCurrentWeather(currentWeather);
}

// get weather forecast for the current city and display
async function getWeatherForecast(geoLocation) {}
//#endregion functions

//#region eventListeners
document.querySelector("#searchBtn")
  .addEventListener("click", async (event) => {
    event.preventDefault();

    const cityInputEl = document.querySelector("#cityInput");
    // Get user input
    const inputArr = cityInputEl.value.split(", ");

    // exit out of the function if user dind't put in a city name
    if (!inputArr) {
      alert("Please type in a city name");
      return;
    }

    const geoLocation = await getGeoLocation(inputArr);

    getCurrentWeather(geoLocation);
    getWeatherForecast(geoLocation);

    // add city to history list and save to localstorage
    citiesObjArr.push(geoLocation);
    localStorage.setItem("city", JSON.stringify(citiesObjArr));
  });
//#endregion eventListeners
