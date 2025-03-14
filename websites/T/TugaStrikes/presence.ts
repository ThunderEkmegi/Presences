const presence = new Presence({
		clientId: "630098355145539595"
	}),
	browsingTimestamp = Math.floor(Date.now() / 1000);

presence.on("UpdateData", () => {
	const presenceData: PresenceData = {
			largeImageKey: "lg"
		},
		[page, section] = window.location.href
			.replace("https://tugastrikes.com/", "")
			.split("/");

	let state;
	switch (section) {
		case "skins": {
			state = "Skins";
			break;
		}
		case "myskins": {
			state = "My Skins";
			break;
		}
		case "buyskins": {
			state = "Buy Skins";
			break;
		}
		case "sellskins": {
			state = "Sell Skins";
			break;
		}
		default:
			state = "Home Page";
	}

	if (page === "market") presenceData.details = "Market";

	presenceData.state = state;

	presenceData.startTimestamp = browsingTimestamp;
	delete presenceData.smallImageKey;

	presence.setActivity(presenceData, true);
});
