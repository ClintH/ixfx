const notesRaw = `0	C-1	8.176
1	C#-1	8.662
2	D-1	9.177
3	D#-1	9.723
4	E-1	10.301
5	F-1	10.913
6	F#-1	11.562
7	G-1	12.250
8	G#-1	12.978
9	A-1	13.750
10	A#-1	14.568
11	B-1	15.434
12	C0	16.352
13	C#0	17.324
14	D0	18.354
15	D#0	19.445
16	E0	20.602
17	F0	21.827
18	F#0	23.125
19	G0	24.500
20	G#0	25.957
21	A0	27.500
22	A#0	29.135
23	B0	30.868
24	C1	32.703
25	C#1	34.648
26	D1	36.708
27	D#1	38.891
28	E1	41.203
29	F1	43.654
30	F#1	46.249
31	G1	48.999
32	G#1	51.913
33	A1	55.000
34	A#1	58.270
35	B1	61.735
36	C2	65.406
37	C#2	69.296
38	D2	73.416
39	D#2	77.782
40	E2	82.407
41	F2	87.307
42	F#2	92.499
43	G2	97.999
44	G#2	103.826
45	A2	110.000
46	A#2	116.541
47	B2	123.471
48	C3	130.813
49	C#3	138.591
50	D3	146.832
51	D#3	155.563
52	E3	164.814
53	F3	174.614
54	F#3	184.997
55	G3	195.998
56	G#3	207.652
57	A3	220.000
58	A#3	233.082
59	B3	246.942
60	C4	261.626
61	C#4	277.183
62	D4	293.665
63	D#4	311.127
64	E4	329.628
65	F4	349.228
66	F#4	369.994
67	G4	391.995
68	G#4	415.305
69	A4	440.000
70	A#4	466.164
71	B4	493.883
72	C5	523.251
73	C#5	554.365
74	D5	587.330
75	D#5	622.254
76	E5	659.255
77	F5	698.456
78	F#5	739.989
79	G5	783.991
80	G#5	830.609
81	A5	880.000
82	A#5	932.328
83	B5	987.767
84	C6	1046.502
85	C#6	1108.731
86	D6	1174.659
87	D#6	1244.508
88	E6	1318.510
89	F6	1396.913
90	F#6	1479.978
91	G6	1567.982
92	G#6	1661.219
93	A6	1760.000
94	A#6	1864.655
95	B6	1975.533
96	C7	2093.005
97	C#7	2217.461
98	D7	2349.318
99	D#7	2489.016
100	E7	2637.020
101	F7	2793.826
102	F#7	2959.955
103	G7	3135.963
104	G#7	3322.438
105	A7	3520.000
106	A#7	3729.310
107	B7	3951.066
108	C8	4186.009
109	C#8	4434.922
110	D8	4698.636
111	D#8	4978.032
112	E8	5274.041
113	F8	5587.652
114	F#8	5919.911
115	G8	6271.927
116	G#8	6644.875
117	A8	7040.000
118	A#8	7458.620
119	B8	7902.133
120	C9	8372.018
121	C#9	8869.844
122	D9	9397.273
123	D#9	9956.063
124	E9	10548.080
125	F9	11175.300
126	F#9	11839.820
127	G9	12543.850`

type ParsedNote = [ noteNumber: number, name: string, frequency: number ]
const notesParsed: ParsedNote[] = []

export const getParsedNotes = () => {
	if (notesParsed.length > 0) return notesParsed;
	const lines = notesRaw.split('\n');
	for (const line of lines) {
		const s = line.split(`\t`);
		if (s.length !== 3) {
			console.warn(`Expected three elements, got ${ s.length }. Line:`, s);
			continue;
		}
		notesParsed.push([ Number.parseInt(s[ 0 ]), s[ 1 ].toUpperCase(), Number.parseFloat(s[ 2 ]) ]);
	}
	return notesParsed;
}

export const noteNameToNumber = (name: string): number => {
	const notes = getParsedNotes();
	name = name.toUpperCase();
	const n = notes.find(n => n[ 1 ] === name);
	if (n) {
		return n[ 0 ];
	}
	return Number.NaN;
}

export const noteNameToFrequency = (name: string): number => {
	const notes = getParsedNotes();
	name = name.toUpperCase();
	const n = notes.find(n => n[ 1 ] === name);
	if (n) {
		return n[ 2 ];
	}
	return Number.NaN;
}

export const noteNumberToName = (number: number): string => {
	const notes = getParsedNotes();
	const n = notes.find(n => n[ 0 ] === number);
	if (n) {
		return n[ 1 ];
	}
	return ``;
}

export const noteNumberToFrequency = (number: number): number => {
	const notes = getParsedNotes();
	const n = notes.find(n => n[ 0 ] === number);
	if (n) {
		return n[ 2 ];
	}
	return Number.NaN;
}

