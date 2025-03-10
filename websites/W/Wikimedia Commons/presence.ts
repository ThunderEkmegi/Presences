const presence = new Presence({
	clientId: "733216837843812444"
});

let currentURL = new URL(document.location.href),
	currentPath = currentURL.pathname.replace(/^\/|\/$/g, "").split("/");
const browsingTimestamp = Math.floor(Date.now() / 1000);
let presenceData: PresenceData = {
	details: "Viewing an unsupported page",
	largeImageKey: "lg",
	startTimestamp: browsingTimestamp
};
const updateCallback = {
		_function: null as () => void,
		get function(): () => void {
			return this._function;
		},
		set function(parameter) {
			this._function = parameter;
		},
		get present(): boolean {
			return this._function !== null;
		}
	},
	/**
	 * Initialize/reset presenceData.
	 */
	resetData = (
		defaultData: PresenceData = {
			details: "Viewing an unsupported page",
			largeImageKey: "lg",
			startTimestamp: browsingTimestamp
		}
	): void => {
		currentURL = new URL(document.location.href);
		currentPath = currentURL.pathname.replace(/^\/|\/$/g, "").split("/");
		presenceData = { ...defaultData };
	},
	/**
	 * Search for URL parameters.
	 * @param urlParam The parameter that you want to know about the value.
	 */
	getURLParam = (urlParam: string): string => {
		return currentURL.searchParams.get(urlParam);
	};

((): void => {
	let title: string;
	const actionResult = (): string =>
			getURLParam("action") || getURLParam("veaction"),
		titleFromURL = (): string => {
			return decodeURI(
				(currentPath[1] === "index.php"
					? getURLParam("title")
					: currentPath.slice(1).join("/")
				).replaceAll("_", " ")
			);
		};

	try {
		title = document.querySelector("h1").textContent;
	} catch (e) {
		title = titleFromURL();
	}

	/**
	 * Returns details based on the namespace.
	 * @link https://commons.wikimedia.org/wiki/Help:Namespaces
	 */
	const namespaceDetails = (): string => {
		const details: { [index: string]: string } = {
			"-2": "Viewing a media",
			"-1": "Viewing a special page",
			0: "Viewing a gallery",
			1: "Viewing a talk page",
			2: "Viewing a user page",
			3: "Viewing a user talk page",
			4: "Viewing a project page",
			5: "Viewing a project talk page",
			6: "Viewing a file",
			7: "Viewing a file talk page",
			8: "Viewing an interface page",
			9: "Viewing an interface talk page",
			10: "Viewing a template",
			11: "Viewing a template talk page",
			12: "Viewing a help page",
			13: "Viewing a help talk page",
			14: "Viewing a category",
			15: "Viewing a category talk page",
			100: "Viewing a creator template",
			101: "Viewing a creator template talk page",
			102: "Viewing a media's subtitles",
			103: "Viewing a media's subtitles talk page",
			104: "Viewing a sequence",
			105: "Viewing a sequence talk page",
			106: "Viewing a institution template",
			107: "Viewing a institution template talk page",
			460: "Viewing a campaign",
			461: "Viewing a campaign talk page",
			486: "Viewing a data",
			487: "Viewing a data talk page",
			490: "Viewing a GWToolset page",
			491: "Viewing a GWToolset talk page",
			828: "Viewing a module",
			829: "Viewing a module talk page",
			1198: "Viewing a translation",
			1199: "Viewing a translation talk page",
			2300: "Viewing a gadget",
			2301: "Viewing a gadget talk page",
			2302: "Viewing a gadget definition page",
			2303: "Viewing a gadget definition talk page",
			2600: "Viewing a topic"
		};
		return (
			details[
				[...document.querySelector("body").classList]
					.find(v => /ns--?\d/.test(v))
					.slice(3)
			] || "Viewing a page"
		);
	};

	//
	// Important note:
	//
	// When checking for the current location, avoid using the URL.
	// The URL is going to be different in other languages.
	// Use the elements on the page instead.
	//

	if (
		(
			document.querySelector<HTMLAnchorElement>("#n-mainpage a") ||
			document.querySelector<HTMLAnchorElement>("#p-navigation a") ||
			document.querySelector<HTMLAnchorElement>(".mw-wiki-logo")
		).href === currentURL.href
	)
		presenceData.details = "On the main page";
	else if (document.querySelector("#wpLoginAttempt"))
		presenceData.details = "Logging in";
	else if (document.querySelector("#wpCreateaccount"))
		presenceData.details = "Creating an account";
	else if (document.querySelector(".searchresults")) {
		presenceData.details = "Searching for a page";
		presenceData.state = (
			document.querySelector("input[type=search]") as HTMLInputElement
		).value;
	} else if (actionResult() === "history") {
		presenceData.details = "Viewing revision history";
		presenceData.state = titleFromURL();
	} else if (getURLParam("diff")) {
		presenceData.details = "Viewing difference between revisions";
		presenceData.state = titleFromURL();
	} else if (getURLParam("oldid")) {
		presenceData.details = "Viewing an old revision of a page";
		presenceData.state = titleFromURL();
	} else if (document.querySelector("#ca-ve-edit") || getURLParam("veaction")) {
		presenceData.state = `${
			title.toLowerCase() === titleFromURL().toLowerCase()
				? `${title}`
				: `${title} (${titleFromURL()})`
		}`;
		updateCallback.function = (): void => {
			if (actionResult() === "edit" || actionResult() === "editsource")
				presenceData.details = "Editing a page";
			else presenceData.details = namespaceDetails();
		};
	} else if (actionResult() === "edit") {
		presenceData.details = document.querySelector("#ca-edit")
			? "Editing a page"
			: "Viewing source";
		presenceData.state = titleFromURL();
	} else {
		presenceData.details = namespaceDetails();
		presenceData.state = `${
			title.toLowerCase() === titleFromURL().toLowerCase()
				? `${title}`
				: `${title} (${titleFromURL()})`
		}`;
	}
})();

if (updateCallback.present) {
	const defaultData = { ...presenceData };
	presence.on("UpdateData", async () => {
		resetData(defaultData);
		updateCallback.function();
		presence.setActivity(presenceData);
	});
} else {
	presence.on("UpdateData", async () => {
		presence.setActivity(presenceData);
	});
}
