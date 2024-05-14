// DECLARE VARIABLE
let CURRENT_LATITUDE = "";
let CURRENT_LONGITUDE = "";
let TIMEZONE = 25200;
let IS_SIDEBAR_OPEN = false;

$(document).ready(function () {
    initial();
    getDateNow();
    getTimeZone()
    checkGeolocation();

    $('#shadowSidebar').click(function () {
        $('#shadowSidebar').hide();
        $('#sidebarDetail').addClass('translate-x-[470px]');
        setTimeout(function () {
            $('#sidebarDetail').hide();
        }, 1000)
    })
});

// DECLARE FUNCTION
function showDetailHandler() {
    $('#shadowSidebar').show();
    $('#sidebarDetail').show();
    $('#sidebarDetail').removeClass('translate-x-[470px]');
    IS_SIDEBAR_OPEN = true;
}

function checkGeolocation() {
    // Check if geolocation is supported by the browser
    if ("geolocation" in navigator) {
        // Prompt user for permission to access their location
        navigator.geolocation.getCurrentPosition(
            // Success callback functionsetMainLoadingView();
            (position) => {
                // Get the user's latitude and longitude coordinates
                CURRENT_LATITUDE = position.coords.latitude;
                CURRENT_LONGITUDE = position.coords.longitude;

                // Do something with the location data, e.g. display on a map
                setForecastLoadingView();
                setMainLoadingView();
                getCurrentWeather();
                getForecast();
            },
            // Error callback function
            (error) => {
                // Handle errors, e.g. user denied location sharing permissions
                $("#weatherStatus").html(`<span class="text-white text-xl">Izinkan lokasi untuk dapat melihat cuaca di lokasi anda</span> &#128506;`);
                $("#currentTempContainer").html("");
                $("#cityName").html("");
                $("#mainIcon").html("");
                $("#forecastData").html("");
                console.error("Error getting user location:", error);
            }
        );
    } else {
        // Geolocation is not supported by the browser
        console.error("Geolocation is not supported by this browser.");
    }
}

function getCurrentWeather() {
    const body = {
        latitude: CURRENT_LATITUDE,
        longitude: CURRENT_LONGITUDE
    };

    $.ajax({
        type: "POST",
        dataType: "json",
        url: "api/weather_now",
        data: JSON.stringify(body),
        success: function (results) {
            TIMEZONE = results.timezone;
            setMainView(results.weather[0].main, results.main.temp, results.name);
        },
    });
}

function getForecast() {
    const body = {
        latitude: CURRENT_LATITUDE,
        longitude: CURRENT_LONGITUDE
    };

    $.ajax({
        type: "POST",
        dataType: "json",
        url: "api/forecast",
        data: JSON.stringify(body),
        success: function (results) {
            setForecastView(results);
        }
    });
}

function searchHandler() {
    Swal.fire({
        title: "Lihat Cuaca di Kota Lain",
        input: "text",
        inputAttributes: {
            autocapitalize: "off"
        },
        showCancelButton: true,
        confirmButtonText: "Cari",
        showLoaderOnConfirm: true,
        preConfirm: async (city) => {
            try {
                const response = await fetch("api/city", { method: "POST", body: JSON.stringify({ city }) });
                return response.json();
            } catch (error) {
                Swal.showValidationMessage(`Request failed: ${error}`);
            }
        },
        allowOutsideClick: () => !Swal.isLoading()
    }).then((results) => {
        console.log(results);
        if(results.isConfirmed){
            if (results.value.cod === "404") {
                Swal.fire({
                    icon: "warning",
                    title: "Oops...",
                    text: "Kota tidak ditemukan"
                });
            }else{
                TIMEZONE = results.value.city.timezone;
                setMainView(results.value.list[0].weather[0].main, results.value.list[0].main.temp, results.value.city.name);
                setForecastView(results.value);
                Swal.close();
            }
        }
        
    });
}

function setMainView(status, temp, city) {
    const ICON = getWeatherIcon(status);

    let strStatus = `<p class="text-white font-bold text-3xl">${status}</p>`;
    let strTemp = `<p class="text-white font-bold text-7xl">${temp} &deg;</p>`;
    let strCity = `<p class="font-medium text-dark_text text-2xl">${city}</p> ${getIconDetail()}`;
    let mainIcon = `<img class="my-auto" src="assets/icons/${ICON}" alt="${status}">`;

    $("#weatherStatus").html(strStatus);
    $("#currentTempContainer").html(strTemp);
    $("#cityName").html(strCity);
    $("#cityName").addClass("flex gap-4");
    $("#mainIcon").html(mainIcon);
}

function setForecastView(values) {
    let str = "";

    $.each(values.list, function (index, value) {
        if (index <= 7) {
            str += `
                <div class="px-4 py-4 w-28 text-center rounded-lg bg-white box-border flex flex-col gap-3 items-center">
                    <div class="group flex relative">
                        <div  class="group-hover:opacity-100 transition-opacity bg-gray-800 px-1 text-sm text-gray-100 rounded-md absolute left-1/2 -translate-x-1/2 -top-20 translate-y-full opacity-0 m-4 mx-auto w-max">
                            ${formatDate(value.dt_txt)}
                        </div>
                        <span class="text-primary">${getHour(value.dt_txt)}</span>
                    </div>
                    <div class="w-full">
                        <img src="assets/icons/${getWeatherIcon(value.weather[0].main)}" alt="">
                    </div>
                    <p class="text-primary font-bold">${value.main.temp} &deg;</p>
                </div>
            `;
        }
    });

    $("#forecastData").html(str);
}

function setForecastLoadingView() {
    let str = "";

    for (let i = 0; i < 6; i++) {
        str += `
            <div class="px-4 py-4 w-28 text-center rounded-lg bg-slate-200 box-border flex flex-col gap-3 items-center">
                <p class="animate-pulse h-[24px] bg-gray-300 rounded-md w-[40px]"></p>
                <div class="animate-pulse flex items-center justify-center w-full h-[80px] bg-gray-300 rounded">
                    <svg class="w-10 h-10 text-gray-200" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 18">
                        <path d="M18 0H2a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2Zm-5.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm4.376 10.481A1 1 0 0 1 16 15H4a1 1 0 0 1-.895-1.447l3.5-7A1 1 0 0 1 7.468 6a.965.965 0 0 1 .9.5l2.775 4.757 1.546-1.887a1 1 0 0 1 1.618.1l2.541 4a1 1 0 0 1 .028 1.011Z"/>
                    </svg>
                </div>
                <p class="animate-pulse h-[24px] bg-gray-300 rounded-md w-[30px]"></p>
            </div>
        `;
    }

    $("#forecastData").html(str);
}

function setMainLoadingView() {
    let str = `
        <div class="w-24 flex items-center" id="mainIcon">
            <div class="animate-pulse flex items-center justify-center w-full h-[96px] bg-gray-300 rounded">
                <svg class="w-10 h-10 text-gray-200" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 18">
                    <path d="M18 0H2a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2Zm-5.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm4.376 10.481A1 1 0 0 1 16 15H4a1 1 0 0 1-.895-1.447l3.5-7A1 1 0 0 1 7.468 6a.965.965 0 0 1 .9.5l2.775 4.757 1.546-1.887a1 1 0 0 1 1.618.1l2.541 4a1 1 0 0 1 .028 1.011Z" />
                </svg>
            </div>
        </div>
        <div class="flex flex-col justify-center gap-2">
            <div id="weatherStatus">
                <p class="animate-pulse h-[36px] bg-gray-300 rounded-md w-36"></p>
            </div>
            <div id="currentTempContainer">
                <p class="animate-pulse h-[72px] bg-gray-200 rounded-md w-[224px]"></p>
            </div>
            <div id="cityName">
                <p class="animate-pulse h-[32px] bg-gray-300 rounded-md w-36"></p>
            </div>
        </div>
    `;

    $("#mainWeatherView").html(str);
}

function initial() {
    $('#shadowSidebar').hide();
    $('#sidebarDetail').hide();
}

// HELPER
function getWeatherIcon(status) {
    switch (status) {
        case "Clouds":
            return "cloudy.png";
        case "Clear":
            return "sun.png";
        case "Rain":
            return "rainy-day.png";
        case "Drizzle":
            return "cloudy_2.png";
        case "Thunderstorm":
            return "storm.png";
        default:
            return "sun.png";
    }
}

function formatDate(value) {
    const date = new Date(value);

    const options = {
        year: "numeric",
        month: "long",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
    };

    return date.toLocaleDateString("id-ID", options);
}

function getHour(hour) {
    return hour.substring(11, 16);
}

function startTime() {
    const today = new Date();
    let h = today.getHours();
    let m = today.getMinutes();
    let s = today.getSeconds();
    m = checkTime(m);
    s = checkTime(s);
    document.getElementById('realTime').innerHTML = h + ":" + m + ":" + s;
    setTimeout(startTime, 1000);
}

function checkTime(i) {
    if (i < 10) { i = "0" + i };  // add zero in front of numbers < 10
    return i;
}

function getSunTime(timestamp, timezone) {
    // Convert timezone offset to minutes
    let timezoneOffsetInMinutes = timezone / 60;

    // Buat objek Date dari timestamp
    let date = new Date((timestamp + timezone) * 1000);

    // Konversi ke format waktu lokal yang dapat dibaca manusia
    let options = {
        timeZone: 'UTC', // Kita mengubah waktu berdasarkan offset, jadi gunakan UTC
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    };

    let readableDate = date.toLocaleString('en-US', options);

    // Jika Anda ingin melihat hasil di konsol juga
    console.log(readableDate + ' UTC+' + (timezoneOffsetInMinutes / 60));
}

function getDateNow() {
    // Mendapatkan tanggal saat ini
    let tanggalSekarang = new Date();

    // Format tanggal
    let options = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    };

    // Mendapatkan tanggal dalam format yang diinginkan
    let tanggalFormatted = tanggalSekarang.toLocaleDateString('id-ID', options);

    // Menampilkan tanggal
    $("#nowDate").html(tanggalFormatted);
}

function getTimeZone() {
    // Create a new Date object representing the current date and time in UTC
    const now = new Date();

    // Get the current UTC time in milliseconds
    const utcTime = now.getTime();

    // Calculate the offset for the time zone
    const timeZoneOffset = TIMEZONE * 1000; // Convert seconds to milliseconds

    // Calculate the current time in the time zone with the given offset
    const timeInTimeZone = new Date(utcTime + timeZoneOffset);

    // Format the time as a string (HH:MM:SS)
    const hours = timeInTimeZone.getUTCHours().toString().padStart(2, '0');
    const minutes = timeInTimeZone.getUTCMinutes().toString().padStart(2, '0');
    const seconds = timeInTimeZone.getUTCSeconds().toString().padStart(2, '0');
    document.getElementById('realTime').innerHTML = hours + ":" + minutes + ":" + seconds;

    setTimeout(getTimeZone, 1000)

}

function getIconDetail() {
    return `<div id="getDetailInfo" onclick="showDetailHandler()" class="w-8 h-8 rounded-full hover:bg-white cursor-pointer transition-all ease-in-out duration-300"> <svg class="fill-white hover:fill-primary" xmlns="http://www.w3.org/2000/svg" id="Outline" viewBox="0 0 24 24"><path d="M15.4,9.88,10.81,5.29a1,1,0,0,0-1.41,0,1,1,0,0,0,0,1.42L14,11.29a1,1,0,0,1,0,1.42L9.4,17.29a1,1,0,0,0,1.41,1.42l4.59-4.59A3,3,0,0,0,15.4,9.88Z"/></svg></div>`;
}