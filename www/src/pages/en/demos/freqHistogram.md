---
title: Frequency Histogram
setup: |
  import { Markdown } from 'astro/components';
  import Layout from '../../../layouts/MainLayout.astro';
  import FreqHistogramPlay from './FreqHistogramPlay.astro';
---

A Frequency Histogram (FreqHisto for short) keeps track of the number of times a certain value is 'seen'. 

In the demo below, a weighted distribution of random numbers is produced, adding the each number to the histogram. The histogram is visualised using the `Histogram` component.

<FreqHistogramPlay />

For example, perhaps every time the pointer moves, you want to record its rough angular direction: up, down, left or right. If you log this to the FreqHisto, at any point you can find out the most frequently occurring direction, or, say, the proportion of upward moves compared to downward. 
