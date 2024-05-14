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
            TIMEZONE = results.value.city.timezone;
            setMainView(results.value.list[0].weather[0].main, results.value.list[0].main.temp, results.value.city.name);
            setForecastView(results.value);
        }

        Swal.close();
    });
}

export {getCurrentWeather, getForecast, searchHandler};