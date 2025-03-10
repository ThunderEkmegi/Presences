const presence = new Presence({
		clientId: "895232122892214313"
	}),
	path: string = document.location.pathname,
	strings = presence.getStrings({
		play: "presence.playback.playing",
		pause: "presence.playback.paused"
	}),
	details = { view: "Viewing anime:", stream: "Watching anime:" };

let video = {
		duration: 0,
		currentTime: 0,
		paused: true,
		isPlaying: false
	},
	everPlaying = false;

presence.on(
	"iFrameData",
	(data: {
		duration: number;
		currentTime: number;
		paused: boolean;
		isPlaying: boolean;
	}) => {
		video = data;
		if (data.isPlaying) everPlaying = true;
	}
);
presence.on("UpdateData", async () => {
	const presenceData: PresenceData = {
		largeImageKey: "kayo",
		startTimestamp: Date.now()
	};

	switch (path) {
		case "/":
			presenceData.details = "Viewing home page";
			break;
		case "/anime-series/":
			presenceData.details = "Viewing Anime series";
			break;
		case "/ongoing-anime/":
			presenceData.details = "Viewing Ongoing anime";
			break;
		case "/anime-movie/":
			presenceData.details = "Viewing Anime movie";
			break;
		case "/request-anime/":
			presenceData.details = "Viewing Anime request";
			break;
		case "/report-dead-links/":
			presenceData.details = "Viewing report dead links";
			break;

		default:
			if (document.querySelector(".entry-header-outer > .entry-header > h1 ")) {
				if (
					document.querySelector(".tie-fluid-width-video-wrapper") &&
					everPlaying
				) {
					if (video && !isNaN(video.duration)) {
						const [start, end] = presence.getTimestamps(
							Math.floor(video.currentTime),
							Math.floor(video.duration)
						);
						presenceData.smallImageKey = video.paused ? "pause" : "play";
						presenceData.smallImageText = video.paused
							? (await strings).pause
							: (await strings).play;
						presenceData.startTimestamp = start;
						presenceData.endTimestamp = end;
						presenceData.details = details.stream;
						presenceData.state = document.querySelector(
							".entry-header-outer > .entry-header > h1 "
						).textContent;
						if (video.paused) {
							delete presenceData.startTimestamp;
							delete presenceData.endTimestamp;
						}
					}
				} else {
					presenceData.details = details.view;
					presenceData.state = document.querySelector(
						".entry-header-outer > .entry-header > h1 "
					).textContent;
				}
				break;
			}
			presenceData.details = "Viewing genre:";
			presenceData.state = document.querySelector(".page-title").textContent;
			break;
	}
	if (document.location.search.startsWith("?s")) {
		presenceData.smallImageKey = "search";
		presenceData.details = "Searching for:";
		presenceData.state = document
			.querySelector("label input")
			.attributes.getNamedItem("value").value;
	}
	return presence.setActivity(presenceData, true);
});
