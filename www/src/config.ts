export const SITE = {
	title: 'ixfx docs',
	description: 'ixfx documentation',
	defaultLanguage: 'en_US',
};

export const OPEN_GRAPH = {
	image: {
		src: 'https://github.com/withastro/astro/blob/main/assets/social/banner.jpg?raw=true',
		alt: 'astro logo on a starry expanse of space,' + ' with a purple saturn-like planet floating in the right foreground',
	},
	twitter: 'astrodotbuild',
};

export const KNOWN_LANGUAGES = {
	English: 'en',
};

// Uncomment this to add an "Edit this page" button to every page of documentation.
// export const GITHUB_EDIT_URL = `https://github.com/withastro/astro/blob/main/docs/`;

// Uncomment this to add an "Join our Community" button to every page of documentation.
// export const COMMUNITY_INVITE_URL = `https://astro.build/chat`;

// Uncomment this to enable site search.
// See "Algolia" section of the README for more information.
// export const ALGOLIA = {
//   indexName: 'XXXXXXXXXX',
//   apiKey: 'XXXXXXXXXX',
// }

export const SIDEBAR = {
	en: [
		{ text: '', header: true },
		{ text: 'Section Header', header: true },
		{ text: 'Introduction', link: 'en/introduction' },
		{ text: 'Modulation', header: true },
		{ text: 'Introduction', link: 'en/modulation/' },
		{ text: 'Envelope', link: 'en/modulation/envelope' },

		{ text: 'Collections', header: true },
		{ text: 'Circular Array', link: 'en/data/circularArray' },
		{ text: 'Set', link: 'en/data/circularArray' },
		{ text: 'Queue', link: 'en/data/circularArray' },
		{ text: 'Stack', link: 'en/data/circularArray' },
		{ text: 'MapOf', link: 'en/data/circularArray' },

		
		{ text: 'Data', header: true },
		{ text: 'State Machine', link: 'en/data/stateMachine' },
		{ text: 'Frequency Histogram', link: 'en/data/freqHistogram' },

		{ text: 'Geometry', header: true },
		{ text: 'Point', link: 'en/geometry/point' },
		{ text: 'Line', link: 'en/geometry/line' },
		{ text: 'Arcs & Circles', link: 'en/geometry/circle' },
		{ text: 'Rectangle', link: 'en/geometry/rectangle' },
		{ text: 'Curve', link: 'en/geometry/curve' },
		{ text: 'Paths', link: 'en/geometry/compound' },
		{ text: 'Grid', link: 'en/geometry/grid' },

		{ text: 'Visualisation', header: true },
		{ text: 'Drawing', link: 'en/visualisation/drawing' },
		{ text: 'Plot', link: 'en/visualisation/drawing' },


	],
};
