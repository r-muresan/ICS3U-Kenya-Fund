var urlParams = new URLSearchParams(window.location.search);
var sessionId = urlParams.get("session_id")

if (sessionId) {
    fetch("/checkout-session?sessionId=" + sessionId).then(function(result) {
        return result.json()
    }).then(function(session) {

        var sessionJSON = JSON.stringify(session, null, 2);
        console.log(sessionJSON)

        document.getElementById("submitName").addEventListener("click", function() {
            let name = document.getElementById("name").value;
            fetch("/sendInfo", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    name: name,
                    sessionJSON: sessionJSON
                })
            }).then(location.replace("http://localhost:8888"));
        });
        document.getElementById("submitAnon").addEventListener("click", function() {
            let name = "Anonymous"
            fetch("/sendInfo", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    name: name,
                    sessionJSON: sessionJSON
                })
            }).then(location.replace("http://localhost:8888"));
        });
    }).catch(function(err) {
        console.log('Error when fetching Checkout session', err);
    });
} else {
    location.replace("http://localhost:8888")
}