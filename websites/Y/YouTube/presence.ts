const presence = new Presence({
		clientId: "463097721130188830"
	}),
	// YouTube TV separator pattern
	pattern = "•";

function truncateAfter(str: string, pattern: string): string {
	return str.slice(0, str.indexOf(pattern));
}

async function getStrings() {
	return presence.getStrings(
		{
			play: "general.playing",
			pause: "general.paused",
			live: "general.live",
			ad: "youtube.ad",
			search: "general.searchFor",
			browsingVid: "youtube.browsingVideos",
			browsingPlayl: "youtube.browsingPlaylists",
			viewCPost: "youtube.viewingCommunityPost",
			ofChannel: "youtube.ofChannel",
			readChannel: "youtube.readingChannel",
			searchChannel: "youtube.searchChannel",
			trending: "youtube.trending",
			browsingThrough: "youtube.browsingThrough",
			subscriptions: "youtube.subscriptions",
			library: "youtube.library",
			history: "youtube.history",
			purchases: "youtube.purchases",
			reports: "youtube.reportHistory",
			upload: "youtube.upload",
			viewChannel: "general.viewChannel",
			viewAllPlayL: "youtube.viewAllPlaylist",
			viewEvent: "youtube.viewLiveEvents",
			viewLiveDash: "youtube.viewLiveDashboard",
			viewAudio: "youtube.viewAudioLibrary",
			studioVid: "youtube.studio.viewVideos",
			studioEdit: "youtube.studio.editVideo",
			studioAnaly: "youtube.studio.videoAnalytics",
			studioComments: "youtube.studio.videoComments",
			studioTranslate: "youtube.studio.videoTranslations",
			studioTheir: "youtube.studio.viewTheir",
			studioCAnaly: "youtube.studio.channelAnalytics",
			studioCComments: "youtube.studio.channelComments",
			studioCTranslate: "youtube.studio.channelTranslations",
			studioArtist: "youtube.studio.artistPage",
			studioDash: "youtube.studio.dashboard",
			viewPlaylist: "general.viewPlaylist",
			readAbout: "general.readingAbout",
			viewAccount: "general.viewAccount",
			viewHome: "general.viewHome",
			watchVid: "general.watchingVid",
			watchLive: "general.watchingLive",
			browsing: "general.browsing",
			searchSomething: "general.searchSomething",
			watchStreamButton: "general.buttonWatchStream",
			watchVideoButton: "general.buttonWatchVideo",
			viewChannelButton: "general.buttonViewChannel"
		},
		await presence.getSetting<string>("lang").catch(() => "en")
	);
}

let strings: Awaited<ReturnType<typeof getStrings>>,
	oldLang: string = null;

presence.on("UpdateData", async () => {
	//* Update strings if user selected another language.
	const [
		newLang,
		privacy,
		time,
		vidDetail,
		vidState,
		channelPic,
		logo,
		buttons
	] = await Promise.all([
		presence.getSetting<string>("lang").catch(() => "en"),
		presence.getSetting<boolean>("privacy"),
		presence.getSetting<boolean>("time"),
		presence.getSetting<string>("vidDetail"),
		presence.getSetting<string>("vidState"),
		presence.getSetting<boolean>("channelPic"),
		presence.getSetting<number>("logo"),
		presence.getSetting<boolean>("buttons")
	]);

	if (oldLang !== newLang || !strings) {
		oldLang = newLang;
		strings = await getStrings();
	}

	//* If there is a vid playing
	const video = Array.from(
		document.querySelectorAll<HTMLVideoElement>(".video-stream")
	).find(video => video.duration);

	if (video) {
		let oldYouTube: boolean = null,
			YouTubeTV: boolean = null,
			YouTubeEmbed: boolean = null,
			title: HTMLElement,
			pfp: string;

		//* Checking if user has old YT layout.
		document.querySelector(".watch-title")
			? (oldYouTube = true)
			: (oldYouTube = false);

		document.querySelector(".player-video-title")
			? (YouTubeTV = true)
			: (YouTubeTV = false);

		document.location.pathname.includes("/embed")
			? (YouTubeEmbed = true)
			: (YouTubeEmbed = false);

		//* Due to differences between old and new YouTube, we should add different selectors.
		// Get title
		YouTubeEmbed
			? (title = document.querySelector("div.ytp-title-text > a"))
			: oldYouTube && document.location.pathname.includes("/watch")
			? (title = document.querySelector(".watch-title"))
			: YouTubeTV
			? (title = document.querySelector(".player-video-title"))
			: !document.location.pathname.includes("/watch")
			? (title = document.querySelector(".ytd-miniplayer .title"))
			: (title = document.querySelector(
					"h1 yt-formatted-string.ytd-video-primary-info-renderer"
			  ));

		let uploaderTV: Element | string,
			uploaderMiniPlayer: HTMLElement,
			uploader2: HTMLElement,
			edited: boolean,
			uploaderEmbed: HTMLElement;
		(edited = false),
			(uploaderTV =
				document.querySelector(".player-video-details") ||
				document.querySelector(
					"ytd-video-owner-renderer  .ytd-channel-name a"
				)),
			(uploaderEmbed = document.querySelector(
				"div.ytp-title-expanded-heading > h2 > a"
			)),
			(uploaderMiniPlayer = document.querySelector(
				"yt-formatted-string#owner-name"
			)),
			(uploader2 = document.querySelector("#owner-name a"));

		if (uploaderMiniPlayer && uploaderMiniPlayer.textContent === "YouTube") {
			edited = true;
			uploaderMiniPlayer.setAttribute(
				"premid-value",
				"Listening to a playlist"
			);
		}

		const uploader =
				uploaderMiniPlayer && uploaderMiniPlayer.textContent.length > 0
					? uploaderMiniPlayer
					: uploader2 && uploader2.textContent.length > 0
					? uploader2
					: document.querySelector(
							"#upload-info yt-formatted-string.ytd-channel-name a"
					  )
					? document.querySelector(
							"#upload-info yt-formatted-string.ytd-channel-name a"
					  )
					: uploaderEmbed &&
					  YouTubeEmbed &&
					  uploaderEmbed.textContent.length > 0
					? uploaderEmbed
					: (uploaderTV = truncateAfter(
							uploaderTV.textContent.replace(/\s+/g, ""),
							pattern
					  )),
			live = Boolean(document.querySelector(".ytp-live"));
		let isPlaylistLoop = false;

		if (
			document.querySelector("#playlist-actions .yt-icon-button#button") &&
			document
				.querySelector("#playlist-actions .yt-icon-button#button")
				.getAttribute("aria-pressed")
		) {
			isPlaylistLoop =
				document
					.querySelector("#playlist-actions .yt-icon-button#button")
					.getAttribute("aria-pressed") === "true";
		}

		let finalUploader =
				edited === true
					? uploaderMiniPlayer.getAttribute("premid-value")
					: uploaderTV
					? typeof uploaderTV === "string"
						? uploaderTV
						: uploaderTV.textContent
					: typeof uploader === "string"
					? uploader
					: uploader.textContent,
			finalTitle =
				!title || title.textContent.replace(/\s+/g, "") === ""
					? document.querySelector("div.ytp-title-text > a").textContent
					: title.textContent;

		//* YouTube Movies
		if (
			!title &&
			document.querySelector(
				".title.style-scope.ytd-video-primary-info-renderer"
			)
		) {
			finalTitle = document.querySelector(
				".title.style-scope.ytd-video-primary-info-renderer"
			).textContent;
		}
		if (
			!uploader &&
			document.querySelector(".style-scope.ytd-channel-name > a")
		) {
			finalUploader = document.querySelector(
				".style-scope.ytd-channel-name > a"
			).textContent;
		}
		if (logo === 2) {
			pfp = document
				.querySelector<HTMLImageElement>(
					"#avatar.ytd-video-owner-renderer > img"
				)
				.src.replace(/=s[0-9]+/, "=s512");
		}
		const unlistedPathElement = document.querySelector<SVGPathElement>(
				"g#privacy_unlisted > path"
			),
			unlistedBadgeElement = document.querySelector<SVGPathElement>(
				"h1.title+ytd-badge-supported-renderer path"
			),
			unlistedVideo =
				unlistedPathElement &&
				unlistedBadgeElement &&
				unlistedPathElement.getAttribute("d") ===
					unlistedBadgeElement.getAttribute("d"),
			videoId = document
				.querySelector("#page-manager > ytd-watch-flexy")
				.getAttribute("video-id"),
			presenceData: PresenceData = {
				details: vidDetail
					.replace("%title%", finalTitle)
					.replace("%uploader%", finalUploader),
				state: vidState
					.replace("%title%", finalTitle)
					.replace("%uploader%", finalUploader),
				largeImageKey:
					unlistedVideo || logo === 0 || pfp === ""
						? "yt_lg"
						: logo === 1
						? `https://i3.ytimg.com/vi/${videoId}/hqdefault.jpg`
						: pfp,
				smallImageKey: video.paused
					? "pause"
					: video.loop
					? "repeat-one"
					: isPlaylistLoop
					? "repeat"
					: "play",
				smallImageText: video.paused
					? strings.pause
					: video.loop
					? "On loop"
					: isPlaylistLoop
					? "Playlist on loop"
					: strings.play,
				endTimestamp: presence.getTimestampsfromMedia(video)[1]
			};

		if (vidState.includes("{0}")) delete presenceData.state;

		presence.setTrayTitle(
			video.paused
				? ""
				: !finalTitle
				? document.querySelector(
						".title.style-scope.ytd-video-primary-info-renderer"
				  ).textContent
				: finalTitle
		);

		//* Remove timestamps if paused or live
		if (video.paused || live) {
			delete presenceData.startTimestamp;
			delete presenceData.endTimestamp;

			if (live) {
				presenceData.smallImageKey = "live";
				presenceData.smallImageText = strings.live;
			}
		}

		//* Update title to indicate when an ad is being played
		if (document.querySelector(".ytp-ad-player-overlay")) {
			presenceData.details = strings.ad;
			delete presenceData.state;
		} else if (privacy) {
			if (live) presenceData.details = strings.watchLive;
			else presenceData.details = strings.watchVid;

			delete presenceData.state;
			presenceData.largeImageKey = "yt_lg";
			presenceData.startTimestamp = Math.floor(Date.now() / 1000);
			delete presenceData.endTimestamp;
		} else if (buttons && !unlistedVideo) {
			presenceData.buttons = [
				{
					label: live ? strings.watchStreamButton : strings.watchVideoButton,
					url: document.URL.includes("/watch?v=")
						? document.URL.split("&")[0]
						: `https://www.youtube.com/watch?v=${videoId}`
				},
				{
					label: strings.viewChannelButton,
					url: (
						document.querySelector(
							"#top-row > ytd-video-owner-renderer > a"
						) as HTMLLinkElement
					).href
				}
			];
		}
		if (!time) {
			delete presenceData.startTimestamp;
			delete presenceData.endTimestamp;
		}

		if (!presenceData.details) presence.setActivity();
		else presence.setActivity(presenceData);
	} else if (
		document.location.hostname === "www.youtube.com" ||
		document.location.hostname === "youtube.com"
	) {
		const presenceData: PresenceData = {
				largeImageKey: "yt_lg"
			},
			browsingStamp = Math.floor(Date.now() / 1000);
		let searching = false;

		if (document.location.pathname.includes("/results")) {
			searching = true;
			let search: HTMLInputElement;
			//When searching something
			search = document.querySelector(
				"#search-input > div > div:nth-child(2) > input"
			);
			if (!search) search = document.querySelector("#search-input > input");

			presenceData.details = strings.search;
			presenceData.state = search.value;
			presenceData.smallImageKey = "search";
			presenceData.startTimestamp = browsingStamp;
		} else if (
			document.location.pathname.includes("/channel") ||
			document.location.pathname.includes("/c") ||
			document.location.pathname.includes("/user")
		) {
			//Sometimes causes problems
			let user: string;
			//get channel name when viewing a community post
			if (
				document.querySelector("#author-text.ytd-backstage-post-renderer") &&
				document.title
					.substr(0, document.title.lastIndexOf(" - YouTube"))
					.includes(
						document
							.querySelector("#author-text.ytd-backstage-post-renderer")
							.textContent.trim()
					)
			) {
				user = document.querySelector(
					"#author-text.ytd-backstage-post-renderer"
				).textContent;
				//get channel name when viewing a channel
			} else if (
				document.querySelector("#text.ytd-channel-name") &&
				document.title
					.substr(0, document.title.lastIndexOf(" - YouTube"))
					.includes(
						document.querySelector("#text.ytd-channel-name").textContent
					)
			)
				user = document.querySelector("#text.ytd-channel-name").textContent;
			//get channel name from website's title
			else if (
				/\(([^)]+)\)/.test(
					document.title.substr(0, document.title.lastIndexOf(" - YouTube"))
				)
			) {
				user = document.title
					.substr(0, document.title.lastIndexOf(" - YouTube"))
					.replace(/\(([^)]+)\)/, "");
			} else {
				user = document.title.substr(
					0,
					document.title.lastIndexOf(" - YouTube")
				);
			}

			// don't remove the second, includes an invisible character
			if (user.replace(/\s+/g, "") === "" || user.replace(/\s+/g, "") === "‌")
				user = "null";

			if (document.location.pathname.includes("/videos")) {
				presenceData.details = strings.browsingThrough;
				presenceData.state = `${strings.ofChannel} ${user}`;
				presenceData.startTimestamp = browsingStamp;
			} else if (document.location.pathname.includes("/playlists")) {
				presenceData.details = strings.browsingPlayl;
				presenceData.state = `${strings.ofChannel} ${user}`;
				presenceData.startTimestamp = browsingStamp;
			} else if (document.location.pathname.includes("/community")) {
				presenceData.details = strings.viewCPost;
				presenceData.state = `${strings.ofChannel} ${user}`;
				presenceData.startTimestamp = browsingStamp;
			} else if (document.location.pathname.includes("/about")) {
				presenceData.details = strings.readChannel;
				presenceData.state = user;
				presenceData.smallImageKey = "reading";
				presenceData.startTimestamp = browsingStamp;
			} else if (document.location.pathname.includes("/search")) {
				searching = true;
				const [, search] = document.URL.split("search?query=");
				presenceData.details = strings.searchChannel.replace("{0}", user);
				presenceData.state = search;
				presenceData.smallImageKey = "search";
				presenceData.startTimestamp = browsingStamp;
			} else {
				presenceData.details = strings.viewChannel;
				presenceData.state = user;
				presenceData.startTimestamp = browsingStamp;
			}
			if (channelPic) {
				const channelImg =
					document //self channel
						.querySelector<HTMLImageElement>(
							"yt-img-shadow.ytd-channel-avatar-editor > img"
						)
						?.src.replace(/=s[0-9]+/, "=s512") ??
					document
						.querySelector<HTMLImageElement>(
							"#avatar.ytd-c4-tabbed-header-renderer > img"
						)
						?.src.replace(/=s[0-9]+/, "=s512") ??
					document //when viewing a community post
						.querySelector<HTMLImageElement>(
							"#author-thumbnail > a > yt-img-shadow > img"
						)
						?.src.replace(/=s[0-9]+/, "=s512") ??
					"yt_lg";
				if (channelImg) presenceData.largeImageKey = channelImg;
			}
		} else if (document.location.pathname.includes("/post")) {
			presenceData.details = strings.viewCPost;
			const selector: Node = document.querySelector("#author-text");
			presenceData.state =
				(selector && `${strings.ofChannel} ${selector.textContent}`) || null;
			presenceData.startTimestamp = browsingStamp;
		} else if (document.location.pathname.includes("/feed/trending")) {
			presenceData.details = strings.trending;
			presenceData.startTimestamp = browsingStamp;
		} else if (document.location.pathname.includes("/feed/subscriptions")) {
			presenceData.details = strings.browsingThrough;
			presenceData.state = strings.subscriptions;
			presenceData.startTimestamp = browsingStamp;
		} else if (document.location.pathname.includes("/feed/library")) {
			presenceData.details = strings.browsingThrough;
			presenceData.state = strings.library;
			presenceData.startTimestamp = browsingStamp;
		} else if (document.location.pathname.includes("/feed/history")) {
			presenceData.details = strings.browsingThrough;
			presenceData.state = strings.history;
			presenceData.startTimestamp = browsingStamp;
		} else if (document.location.pathname.includes("/feed/purchases")) {
			presenceData.details = strings.browsingThrough;
			presenceData.state = strings.purchases;
			presenceData.startTimestamp = browsingStamp;
		} else if (document.location.pathname.includes("/playlist")) {
			presenceData.details = strings.viewPlaylist;

			let title: HTMLElement | null = document.querySelector("#text-displayed");
			if (!title)
				title = document.querySelector("#title > yt-formatted-string > a");

			presenceData.state = title.textContent;
			presenceData.startTimestamp = browsingStamp;
		} else if (document.location.pathname.includes("/premium")) {
			presenceData.details = strings.readAbout;
			presenceData.state = "Youtube Premium";
			presenceData.smallImageKey = "reading";
			presenceData.startTimestamp = browsingStamp;
		} else if (document.location.pathname.includes("/gaming")) {
			presenceData.details = strings.browsingThrough;
			presenceData.state = "Youtube Gaming";
			presenceData.smallImageKey = "reading";
			presenceData.startTimestamp = browsingStamp;
		} else if (document.location.pathname.includes("/account")) {
			presenceData.details = strings.viewAccount;
			presenceData.startTimestamp = browsingStamp;
		} else if (document.location.pathname.includes("/reporthistory")) {
			presenceData.details = strings.reports;
			presenceData.startTimestamp = browsingStamp;
		} else if (document.location.pathname.includes("/intl")) {
			presenceData.details = strings.readAbout;
			presenceData.state = document.title.substr(
				0,
				document.title.lastIndexOf(" - YouTube")
			);
			presenceData.smallImageKey = "reading";
			presenceData.startTimestamp = browsingStamp;
		} else if (document.URL === "https://www.youtube.com/") {
			presenceData.details = strings.viewHome;
			presenceData.startTimestamp = browsingStamp;
		} else if (document.location.pathname.includes("/upload")) {
			presenceData.details = strings.upload;
			presenceData.startTimestamp = browsingStamp;
			presenceData.smallImageKey = "writing";
		} else if (document.location.pathname.includes("/view_all_playlists")) {
			presenceData.details = strings.viewAllPlayL;
			presenceData.startTimestamp = browsingStamp;
		} else if (document.location.pathname.includes("/my_live_events")) {
			presenceData.details = strings.viewEvent;
			presenceData.startTimestamp = browsingStamp;
		} else if (document.location.pathname.includes("/live_dashboard")) {
			presenceData.details = strings.viewLiveDash;
			presenceData.startTimestamp = browsingStamp;
		} else if (document.location.pathname.includes("/audiolibrary")) {
			presenceData.details = strings.viewAudio;
			presenceData.startTimestamp = browsingStamp;
		}

		if (privacy) {
			if (searching) {
				presenceData.details = strings.searchSomething;
				delete presenceData.state;
			} else {
				presenceData.details = strings.browsing;
				delete presenceData.state;
				delete presenceData.smallImageKey;
			}
		}

		if (!time) {
			delete presenceData.startTimestamp;
			delete presenceData.endTimestamp;
		}

		if (!presenceData.details) presence.setActivity();
		else presence.setActivity(presenceData);
	} else if (document.location.hostname === "studio.youtube.com") {
		const presenceData: PresenceData = {
				largeImageKey: "yt_lg",
				smallImageKey: "studio",
				smallImageText: "Youtube Studio"
			},
			browsingStamp = Math.floor(Date.now() / 1000);

		if (document.location.pathname.includes("/videos")) {
			presenceData.details = strings.studioVid;
			presenceData.startTimestamp = browsingStamp;
		} else if (document.location.pathname.includes("/video")) {
			const title: HTMLElement = document.querySelector("#entity-name");
			presenceData.startTimestamp = browsingStamp;
			if (document.location.pathname.includes("/edit")) {
				presenceData.details = strings.studioEdit;
				presenceData.state = title.textContent;
			} else if (document.location.pathname.includes("/analytics")) {
				presenceData.details = strings.studioAnaly;
				presenceData.state = title.textContent;
			} else if (document.location.pathname.includes("/comments")) {
				presenceData.details = strings.studioComments;
				presenceData.state = title.textContent;
			} else if (document.location.pathname.includes("/translations")) {
				presenceData.details = strings.studioTranslate;
				presenceData.state = title.textContent;
			}
		} else if (document.location.pathname.includes("/analytics")) {
			presenceData.details = strings.studioTheir;
			presenceData.state = strings.studioCAnaly;
			presenceData.startTimestamp = browsingStamp;
		} else if (document.location.pathname.includes("/comments")) {
			presenceData.details = strings.studioTheir;
			presenceData.state = strings.studioCComments;
			presenceData.startTimestamp = browsingStamp;
		} else if (document.location.pathname.includes("/translations")) {
			presenceData.details = strings.studioTheir;
			presenceData.state = strings.studioCTranslate;
			presenceData.startTimestamp = browsingStamp;
		} else if (document.location.pathname.includes("/channel")) {
			presenceData.details = strings.studioDash;
			presenceData.startTimestamp = browsingStamp;
		} else if (document.location.pathname.includes("/artist")) {
			presenceData.details = strings.studioTheir;
			presenceData.state = strings.studioArtist;
			presenceData.startTimestamp = browsingStamp;
		}

		if (privacy) {
			presenceData.details = strings.browsing;
			delete presenceData.state;
			delete presenceData.smallImageKey;
		}

		if (!time) {
			delete presenceData.startTimestamp;
			delete presenceData.endTimestamp;
		}

		if (!presenceData.details) presence.setActivity();
		else presence.setActivity(presenceData);
	}
});
