function ChangeAlertText(sentenceStart, user, sentenceMid, amount, sentenceEnd) {
    const startText = document.getElementById("sentence-start");
    const usernameText = document.getElementById("username");
    const midText = document.getElementById("sentence-mid");
    const amountText = document.getElementById("amount");
    const endText = document.getElementById("sentence-end");

    if (user !== null || user !== "") {
        usernameText.textContent = user;
        usernameText.classList.remove("hidden");
    } else {
        usernameText.classList.add("hidden");
    }

    if (amount !== null || amount !== "") {
        amountText.textContent = amount;
        amountText.classList.remove("hidden");
    } else {
        amountText.classList.add("hidden");
    }

    if (sentenceStart !== null || sentenceStart !== "") {
        startText.textContent = sentenceStart;
        startText.classList.remove("hidden");
    } else {
        startText.classList.add("hidden");
    }

    if (sentenceMid !== null || sentenceMid !== "") {
        midText.textContent = sentenceMid;
        midText.classList.remove("hidden");
    } else {
        midText.classList.add("hidden");
    }
    
    if (sentenceEnd !== null || sentenceEnd !== "") {
        endText.textContent = sentenceEnd;
        endText.classList.remove("hidden");
    } else {
        endText.classList.add("hidden");
    }
}

function SetFlexDirection(alertPos) {
    document.getElementById("overlay").style.flexDirection = alertPos === "top" ? "column" : "column-reverse";

    if (alertPos === "top") {
        document.getElementById("redeem-image").style.bottom = "-1000px";
    } else {
        document.getElementById("redeem-image").style.top = "-1000px";
        document.getElementById("redeem-image").style.transform = "rotateX(180deg)";
    }

}

function ChangeAlertImage(newImage) {
    document.getElementById("alert-image").src = newImage;
}

function ChangeRedeemImage(newImage) {
    document.getElementById("redeem-image").src = newImage;
}

function PlayAudio(audioFile) {
    var audio = document.getElementById("alert-noise");
    audio.src = audioFile;
    audio.play();
}

function ShowAlert() {
    const alertElement = document.getElementById("alert-popup");
    alertElement.classList.add("fadeIn");
    alertElement.classList.remove("fadeOut");
}

function HideAlert() {
    const alertElement = document.getElementById("alert-popup");
    alertElement.classList.add("fadeOut");
    alertElement.classList.remove("fadeIn");
}

function ShowRedeem(direction) {
    const redeemImage = document.getElementById("redeem-image");
    redeemImage.classList.add(direction === "top" ? "moveInTop" : "moveInBottom");
    redeemImage.classList.remove(direction === "top" ? "moveOutTop" : "moveOutBottom");
}

function HideRedeem(direction) {
    const redeemImage = document.getElementById("redeem-image");
    redeemImage.classList.add(direction === "top" ? "moveOutTop" : "moveOutBottom");
    redeemImage.classList.remove(direction === "top" ? "moveInTop" : "moveInBottom");
}

function StartSBotClient(host, port, auth, direction) {
    const client = new StreamerbotClient({
        host: host,
        port: port,
        password: auth,
        subscribe: {
            "Twitch": ["Follow", "Cheer", "Sub", "ReSub", "GiftSub", "Raid", "RewardRedemption"]
        }
    });

    client.on("Twitch.Follow", (_) => {
        ChangeAlertText(null, null, "Thank you for the follow!", null, null);
        ChangeAlertImage("static/img/pipari.png");
        ShowAlert();

        setTimeout(() => {
           HideAlert(); 
        }, 5000);
    });

    client.on("Twitch.Raid", (data) => {
        ChangeAlertText("Thank you", data.data.from_broadcaster_user_name, "for the raid with", data.data.viewers, "people!");
        ChangeAlertImage("static/img/pipspin.gif");
        ShowAlert();
        PlayAudio("static/sound/catch-modern.mp3");

        setTimeout(() => {
           HideAlert(); 
        }, 10000);
    });

    client.on("Twitch.Sub", (data) => {
        ChangeAlertText("Thank you", data.data.user.name, "for the", `tier ${data.data.sub_tier / 1000}`, "subscription!");
        ChangeAlertImage("static/img/pipwaddle.gif");
        ShowAlert();
        PlayAudio("static/sound/catch-classic.mp3");

        setTimeout(() => {
           HideAlert(); 
        }, 10000);
    });

    client.on("Twitch.ReSub", (data) => {
        ChangeAlertText("Thank you", data.data.user.name, "for the resub for", data.data.cumulativeMonths, "months!");
        ChangeAlertImage("static/img/pipwaddle.gif");
        ShowAlert();
        PlayAudio("static/sound/catch-classic.mp3");

        setTimeout(() => {
           HideAlert(); 
        }, 10000);
    });
    
    client.on("Twitch.Cheer", (data) => {
        ChangeAlertText(null, data.data.user.name, "cheered", data.data.bits, "bits!");
        ChangeAlertImage("static/img/pipwai.png");
        ShowAlert();
        PlayAudio("static/sound/heal.mp3");

        setTimeout(() => {
           HideAlert(); 
        }, 10000);
    });

    client.on("Kofi.Donation", (data) => {
        console.log(data);
        ChangeAlertText(null, data.data.from, "donated", `${data.data.amount} ${data.data.currency}`, "via Ko-fi!");
        ChangeAlertImage("static/img/pipspin.gif");
        ShowAlert();
        PlayAudio("static/sound/heal.mp3");

        setTimeout(() => {
           HideAlert(); 
        }, 10000);
    });

    client.on("Twitch.RewardRedemption", (data) => {
        const rewardName = data.data.reward.title;

        switch (rewardName) {
            case "wacky waving inflatable arm flailing tube man":
                const tubeImg = `static/img/tubeman${Math.floor(Math.random() * 5) + 1}.gif`;

                ChangeRedeemImage(tubeImg);

                ShowRedeem(direction);

                setTimeout(() => {
                    HideRedeem(direction);
                }, 5000);
                break;
            case "67":
                ChangeRedeemImage("static/img/67.gif");

                ShowRedeem(direction);

                setTimeout(() => {
                    HideRedeem(direction);
                }, 5000);
                break;
            default:
                break;
        }
        
    })



    return client;
}

function Initialize() {
    // params from URL
    const queryParams = new URLSearchParams(location.search);

    // get streamer.bot port
    const sbotPort = queryParams.get("port") ?? 8080;

    // get streamer.bot host 
    const sbotHost = queryParams.get("host") ?? "127.0.0.1";

    // get authorization if any 
    let sbotPass = queryParams.get("pass") ?? "";
    
    // get alert location, if any
    let alertPos = queryParams.get("alertPosition") ?? "top";

    SetFlexDirection(alertPos);

    const client = StartSBotClient(sbotHost, sbotPort, sbotPass, alertPos);
}

Initialize();