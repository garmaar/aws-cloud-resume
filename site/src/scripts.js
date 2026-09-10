const API_URL =
"https://81zwv999m0.execute-api.us-east-1.amazonaws.com/visits";


fetch(API_URL)

.then(response => response.json())

.then(data => {

    document.getElementById("visits-count").textContent =
    data.visits;

})

.catch(error => {

    console.error(
        "Error loading visits:",
        error
    );

    document.getElementById("visits-count").textContent =
    "Unavailable";

});