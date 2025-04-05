// Selecting Element 
const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtnId");
const locationBtn = document.getElementById("searchLocationBtn");
const weatherContainer = document.querySelector(".dailyCloud-info-Div");
const weeklyContainer = document.querySelector(".weeklyCloud-All-Item");
const recentSearchesDropdown = document.getElementById("recentSearches")


// API Key and Base URL

const API_KEY = "986f4ce0f6a0024c17b7fa5ef113ab78";
const BASE_URL ="https://api.openweathermap.org/data/2.5/forecast";

// Fetch Weather City Data 
async function getWeather(city) {

    // Fetching API usse Pahle Message Show screen Pe Hoga
    try{
        weatherContainer.innerHTML = `<p class="text-blue-500 text-lg">⌛Fetching Weather Data...</p>`;
        weeklyContainer.innerHTML = "";

        const response = await fetch(`${BASE_URL}?q=${city}&units=metric&appid=${API_KEY}`)
        const data = await response.json();

        console.log(data);
        if(data.cod !== "200"){
            throw new Error(data.message);
        }
        displayWeather(data);
        saveRecentSearch(city);

        

    }catch(error){
        weatherContainer.innerHTML = `<p class ="text-red-500 text-lg">⚠️ Error ${error.message}</p>`;
        weeklyContainer.innerHTML =""
    }
    
}


// Display Weather Data 

function displayWeather(data){
    const city = data.city.name;
    const today = new Date();
    const todayDate = today.toISOString().split('T')[0];

    let dailyForecast = [];
    let uniqueDates = new Set();

    for(let item of data.list){
        let forecastDate = item.dt_txt.split(" ")[0];

        if(!uniqueDates.has(forecastDate) && forecastDate >todayDate){
            uniqueDates.add(forecastDate);
            dailyForecast.push(item)
        }

        if(dailyForecast.length===5){
            break;
        }
    }

    // current Day Forecast

    const current = data.list.find(item => item.dt_txt.startsWith(todayDate));

    if(current){

        weatherContainer.innerHTML = `
        <div class="cloudInfo-Item m-4 bg-indigo-500 text-white p-5 rounded-2xl flex flex-col md:flex-row justify-between items-center">
            <div>
                <h2 class="font-semibold text-xl mb-1">${city} ${new Date(current.dt * 1000).toLocaleDateString()}</h2>
                <p>Temperature: ${current.main.temp}°C</p>
                <p>Wind: ${current.wind.speed} M/S</p>
                <p>Humidity: ${current.main.humidity}%</p>
            </div>
            <div class="text-center">
                <img src="https://openweathermap.org/img/wn/${current.weather[0].icon}@2x.png" alt="Weather Icon" class="w-16 h-16 mx-auto">
                <p class="text-lg font-medium">${current.weather[0].description}</p>
            </div>
        </div>
    `;

    }

    // 5-Day Forecast

    weeklyContainer.innerHTML = dailyForecast.map(day =>  `
        <div class="weeklyCloud-Item bg-yellow-700 shadow-lg rounded-lg p-4 text-center text-white w-full">
            <p class ="font-semibold">${new Date(day.dt * 1000).toLocaleDateString()}</p>
            <img src="https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png" alt="Weather Icon" class="w-12 h-12 mx-auto">
            <p class="capitalize">${day.weather[0].description}</p>
            <p>Temp: ${day.main.temp}°C</p>
            <p>Wind: ${day.wind.speed} M/S</p>
            <p>Humidity: ${day.main.humidity}%</p>
        </div>
    `).join("");
}

// function to update recent searches dropdown

function updateDropdown(){
    let searches = JSON.parse(localStorage.getItem("recentSearches"));

    recentSearchesDropdown.innerHTML =`<option value="">🔍 Select Recent City</option>`;

    // default Option
    searches.forEach(city =>{
        let option = document.createElement("option");
        option.value = city;
        option.textContent = city
        recentSearchesDropdown.appendChild(option);
    });

    if(searches.length > 0){
        recentSearchesDropdown.classList.remove("hidden");
    }
    else{
        recentSearchesDropdown.classList.add("hidden");
    }
    
}


// function to save recent searches in localstorage
function saveRecentSearch(city){
    let searches = JSON.parse(localStorage.getItem("recentSearches")) || [];
    if(!searches.includes(city)){
        searches.unshift(city);
        if(searches.length>5){
            searches.pop();
        }
        localStorage.setItem("recentSearches",JSON.stringify(searches));
    }
    updateDropdown();
}

// Event listent serch Dropdown

recentSearchesDropdown.addEventListener("change",(e)=>{
    if(e.target.value){
        getWeather(e.target.value);
    }
});

// search btn Event Listener

searchBtn.addEventListener("click", ()=>{
    let city =searchInput.value.trim();

     // Validate input (only letters allowed)
     if (!city || !/^[a-zA-Z\s]+$/.test(city)) {
        alert("Please enter a valid city name!");
        return;
    }

    getWeather(city);
    searchInput.value = "";
});


// Location btn Listener

locationBtn.addEventListener("click",()=>{
    if(navigator.geolocation){
        navigator.geolocation.getCurrentPosition(async (position) =>{
            const {latitude, longitude} = position.coords;

            try {
                weatherContainer.innerHTML = `<p class="text-blue-500 text-lg">⏳ Fetching weather data...</p>`;
                weeklyContainer.innerHTML = "";

                const response = await fetch(`${BASE_URL}?lat=${latitude}&lon=${longitude}&units=metric&appid=${API_KEY}`);
                const data = await response.json();
                displayWeather(data);
            } catch (error) {
                weatherContainer.innerHTML = `<p class="text-red-500 text-lg">⚠️ Location fetch error: ${error.message}</p>`;
                weeklyContainer.innerHTML = "";
            }
        });
    }
     else {
        alert("Geolocation not supported by your browser");
    }
})

// run code Call UpdateDropDown 
updateDropdown()