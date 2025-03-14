const presence = new Presence({
		clientId: "712838005165129728"
	}),
	strings = presence.getStrings({
		play: "presence.playback.playing",
		pause: "presence.playback.paused"
	}),
	pages: { [k: string]: string } = {
		"/": "Ana Sayfa",
		"/giris-yap": "Giriş Yap",
		"/kayit-ol": "Kayıt Ol",
		"/favorilerim": "Favorilerim",
		"/favori-oyuncularim": "Favori Oyuncularım",
		"/izleyeceklerim": "İzleyeceklerim",
		"/izlediklerim": "İzlediklerim",
		"/profilim": "Profilim",
		"/duyurular": "Duyurular",
		"/altyazili-bolumler": "Altyazılı Bölümler",
		"/turkce-dublaj-bolumler": "Türkçe Dublajlı Bölümler",
		"/trend": "Trendler",
		"/imdb-top-100": "IMDb Top 100",
		"/kanallar": "Kanallar",
		"/dizi-onerileri": "Dizi Önerileri",
		"/iletisim": "İletişim"
	};

interface IframeData {
	duration: number;
	currentTime: number;
	paused: boolean;
}

let video: IframeData;
presence.on("iFrameData", (data: IframeData) => {
	video = data;
});

presence.on("UpdateData", async () => {
	const path: string = document.location.pathname,
		showName: HTMLLinkElement = document.querySelector(
			"div.content > div > div.top-sticky-content h1 > a"
		),
		episode: HTMLSpanElement = document.querySelector(
			"div.content > div > div.top-sticky-content span.text-white.text-small"
		),
		presenceData: PresenceData = {
			largeImageKey: "dz-logo",
			startTimestamp: Math.floor(Date.now() / 1000)
		};

	if (path.startsWith("/dizi/")) {
		presenceData.details = "Bir diziye göz atıyor:";
		presenceData.state =
			document.querySelector(
				"div.content > div > div.top-sticky-content div > h1 > a"
			)?.textContent || "Bilinmeyen Dizi";

		presence.setActivity(presenceData);
	} else if (path.startsWith("/oyuncular/")) {
		presenceData.details = "Bir oyuncuya göz atıyor:";
		presenceData.state =
			document.querySelector(
				"div.content > div > div.top-sticky-content div > span"
			)?.textContent || "Bilinmeyen Oyuncu";

		presence.setActivity(presenceData);
	} else if (path.startsWith("/dizi-turu/")) {
		presenceData.details = "Bir türe göz atıyor:";
		presenceData.state =
			document.querySelector(
				"div.content > div > div.top-sticky-content div > h1"
			)?.textContent || "Bilinmeyen Tür";

		presence.setActivity(presenceData);
	} else if (path.startsWith("/kanal/")) {
		presenceData.details = "Bir kanala göz atıyor:";
		presenceData.state =
			document.title.slice(0, document.title.indexOf("arşivleri")) ||
			"Bilinmeyen Kanal";

		presence.setActivity(presenceData);
	} else if (path.startsWith("/arsiv/")) {
		const query = new URL(document.location.href).searchParams.get("q");

		if (query) {
			presenceData.details = "Bir şey arıyor:";
			presenceData.state =
				query[0].toUpperCase() + query.slice(1).toLowerCase();
			presenceData.smallImageKey = "search";
		} else {
			presenceData.details = "Bir sayfaya göz atıyor:";
			presenceData.state = "Arşiv";
		}

		presence.setActivity(presenceData);
	} else if (pages[path] || pages[path.slice(0, -1)]) {
		presenceData.details = "Bir sayfaya göz atıyor:";
		presenceData.state =
			pages[path] || pages[path.slice(0, -1)] || "Bilinmeyen Sayfa";

		presence.setActivity(presenceData);
	} else if (
		!isNaN(video?.duration) &&
		showName?.textContent &&
		episode?.textContent
	) {
		const [, endTimestamp] = presence.getTimestamps(
			Math.floor(video?.currentTime),
			Math.floor(video?.duration)
		);

		presenceData.details = showName?.textContent || "Bilinmeyen Dizi";
		presenceData.state = episode?.textContent || "Bilinmeyen Bölüm";

		presenceData.smallImageKey = video?.paused ? "pause" : "play";
		presenceData.smallImageText = video?.paused
			? (await strings).pause
			: (await strings).play;

		if (!isNaN(endTimestamp)) presenceData.endTimestamp = endTimestamp;

		if (video.paused) {
			delete presenceData.startTimestamp;
			delete presenceData.endTimestamp;
		}

		presence.setActivity(presenceData);
	} else presence.setActivity();
});
