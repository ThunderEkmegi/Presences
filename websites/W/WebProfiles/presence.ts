const presence = new Presence({
		clientId: "887996093189742612"
	}),
	browsingTimestamp = Math.floor(Date.now() / 1000);

presence.on("UpdateData", async () => {
	const showTimestamp = await presence.getSetting<boolean>("timestamp"),
		showButtons = await presence.getSetting<boolean>("buttons"),
		presenceData: PresenceData = {
			largeImageKey: "webprofiles_logo"
		};

	if (document.location.pathname === "/")
		presenceData.details = "Viewing home page";
	else if (document.location.pathname.includes("/u/")) {
		const username = document.querySelector(
			"p.text-5xl.text-white"
		)?.textContent;
		presenceData.details = "Viewing user:";
		presenceData.state = `${username || "Unknown"} - ❤️ ${
			document.querySelector("#likes-count")?.textContent || 0
		}`;
		presenceData.buttons = [
			{
				label: `View ${username}`,
				url: document.location.href
			}
		];
	} else if (document.location.pathname.includes("/search")) {
		presenceData.details = "Searching for...";
		presenceData.state =
			document.location.href.split("/search/")[1] ?? "Unknown";
		presenceData.smallImageKey = "search";
	} else if (document.location.pathname === "/about/team") {
		presenceData.details = "Viewing page:";
		presenceData.state = "Team";
	} else if (document.location.pathname === "/about/partners") {
		presenceData.details = "Viewing page:";
		presenceData.state = "Partners";
	} else if (document.location.pathname.includes("/discover")) {
		presenceData.details = "Viewing page:";
		presenceData.state = "Discover";
	} else if (document.location.pathname === "/@me")
		presenceData.details = "Viewing my profile";
	else if (document.location.pathname === "/@me/settings")
		presenceData.details = "Editing my profile";
	else if (document.location.pathname.includes("/login"))
		presenceData.details = "Logging in...";
	else if (document.location.pathname.includes("/register"))
		presenceData.details = "Registering...";

	if (!showButtons) delete presenceData.buttons;
	if (showTimestamp) presenceData.startTimestamp = browsingTimestamp;

	presence.setActivity(presenceData);
});
