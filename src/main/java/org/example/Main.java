package org.example;
import com.google.gson.Gson;
import io.javalin.Javalin;
import io.javalin.http.staticfiles.Location;
import io.javalin.rendering.template.JavalinFreemarker;
import kong.unirest.core.HttpResponse;
import kong.unirest.core.JsonNode;
import kong.unirest.core.Unirest;
import kong.unirest.core.json.JSONObject;
import org.example.models.CityModel;
import org.example.models.LocationCurrent;
import org.example.models.Response;

import java.util.HashMap;
import java.util.Map;

public class Main {
    static final String APIKEY = "b4f13ec9c11f7be39494fc1e4106e9a0";
    static final String URL_WEATHER_NOW = "https://api.openweathermap.org/data/2.5/weather";
    static final String URL_FORECAST = "https://api.openweathermap.org/data/2.5/forecast";
    static final double LATITUDE = -7.797068;
    static final double LONGITUDE = 110.370529;
    static Gson gson;

    public static void main(String[] args) {
        int port = 1234;
        if(args.length > 0){
            port = Integer.parseInt(args[0]);
        }

        gson = new Gson();

        Javalin app = Javalin.create(cfg -> {
            cfg.fileRenderer(new JavalinFreemarker());
            cfg.staticFiles.add(staticFileConfig -> {
                staticFileConfig.hostedPath = "/";
                staticFileConfig.directory = "/public";
                staticFileConfig.location = Location.CLASSPATH;
            });
        });

        app.get("/", ctx -> {
            Map<String, Object> attributes = new HashMap<>();
            attributes.put("user", "Ryan");

            ctx.render("/views/main.html",attributes);
        });

        app.post("/api/weather_now", ctx -> {
            String requestBody = ctx.body();
            LocationCurrent location = gson.fromJson(requestBody, LocationCurrent.class);
            JSONObject weatherStatus = getWeather(location.latitude, location.longitude);
            Response<JSONObject> response = new Response<>(200, "Ok", weatherStatus);

            ctx.json(weatherStatus.toString());
        });

        app.post("/api/forecast", ctx -> {
            String requestBody = ctx.body();
            LocationCurrent location = gson.fromJson(requestBody, LocationCurrent.class);
            JSONObject results = getWeatherForecast(location.latitude, location.longitude);

            ctx.json(results.toString());
        });

        app.post("/api/city", ctx -> {
            String requestBody = ctx.body();
            CityModel cityModel = gson.fromJson(requestBody, CityModel.class);
            JSONObject results = getWeatherByCity(cityModel.city);

            ctx.json(results.toString());
        });

        app.start(port);
    }

    public static JSONObject getWeather(double latitude, double longitude){
        return Unirest.get(URL_WEATHER_NOW)
                        .queryString("lat", latitude)
                        .queryString("lon", longitude)
                        .queryString("appid", APIKEY)
                        .queryString("units", "metric")
                        .asJson()
                        .getBody()
                        .getObject();
    }

    public static JSONObject getWeatherForecast(double latitude, double longitude){
        return Unirest.get(URL_FORECAST)
                .queryString("lat", latitude)
                .queryString("lon", longitude)
                .queryString("appid", APIKEY)
                .queryString("units", "metric")
                .asJson()
                .getBody()
                .getObject();
    }

    public static JSONObject getWeatherByCity(String city){
        return Unirest.get(URL_FORECAST)
                .queryString("q", city)
                .queryString("units", "metric")
                .queryString("lang", "id")
                .queryString("appid", APIKEY)
                .asJson()
                .getBody()
                .getObject();
    }

    public static JSONObject getWeatherJSON(){
        HttpResponse<JsonNode> response = Unirest.get(URL_WEATHER_NOW)
                .queryString("lat", LATITUDE)
                .queryString("lon", LONGITUDE)
                .queryString("appid", APIKEY)
                .asJson();

        JSONObject main = response.getBody()
                .getObject()
                .getJSONObject("main");

        return main;
    }
}