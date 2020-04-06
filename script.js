window.onload = function() {
    fetch('/retrieve')
        .then(function(response) {
            return response.json();
        })
        .then(function(jsonObject) {
            let total = 0;
            for (let i = jsonObject.data.length - 1; i >= 0; i--) {
                var name = jsonObject.data[i].name;
                var money = (JSON.parse(jsonObject.data[i].paymentInfo)).display_items['0'].amount;
                total += money;
                addAnotherDonation(name, money / 100);
            }
            fetch('/goals')
                .then(function(response) {
                    return response.json();
                })
                .then(function(goals) {
                    for (let x = 0; x < goals.length; x++) {
                        addAnotherGoal(goals[x].name, goals[x].price, total, goals[x].img);
                        if (goals[x].price > total / 100 && document.getElementById("currentGoal").innerHTML == "Goal") {
                            document.getElementById("currentGoal").innerHTML = goals[x].name;
                            document.getElementById("current").innerHTML = total / 100;
                            document.getElementById("goal").innerHTML = goals[x].price;
                            var bar = new ldBar("#bar");
                            document.getElementById("bar").style.backgroundImage = "url(" + goals[x].img + ")";
                            bar.set(total / goals[x].price);
                        }
                    }
                });
        });
}



var createCheckoutSession = function() {
    var amount = parseInt(document.getElementById("amount").value) * 100;

    return fetch("/create-checkout-session", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            price: amount
        })
    }).then(function(result) {
        return result.json();
    });
};

/* Get your Stripe publishable key to initialize Stripe.js */
fetch("/config")
    .then(function(result) {
        return result.json();
    })
    .then(function(json) {
        window.config = json;
        var stripe = Stripe(config.publicKey);
        // Setup event handler to create a Checkout Session on submit
        document.querySelector("#submit").addEventListener("click", function(evt) {
            createCheckoutSession().then(function(data) {
                stripe
                    .redirectToCheckout({
                        sessionId: data.sessionId
                    })
                    .then(handleResult);
            });
        });
    });

function addAnotherDonation(name, value) {
    var ul = document.getElementById("list");
    var li = document.createElement("li");
    var div1 = document.createElement("div");
    var div2 = document.createElement("div");
    div1.appendChild(document.createTextNode(name))
    div2.appendChild(document.createTextNode("$" + value))
    div1.setAttribute("class", "donationName")
    div2.setAttribute("class", "donationValue")
    li.setAttribute("class", "donationLi")
    li.appendChild(div1);
    li.appendChild(div2);
    ul.appendChild(li)
}

function addAnotherGoal(name, value, currentMoney, img) {
    var ul = document.getElementById("goals");
    var li = document.createElement("li");
    var div1 = document.createElement("div");
    var div2 = document.createElement("div");
    div1.appendChild(document.createTextNode(name))
    div1.setAttribute("class", "goalName")
    div2.setAttribute("style", "width:100%; height:55px;")
    div2.setAttribute("id", name)
    li.setAttribute("class", "goal")
    li.appendChild(div1);
    li.appendChild(div2);
    ul.appendChild(li);
    new ldBar("#" + name).set(currentMoney / value);
}