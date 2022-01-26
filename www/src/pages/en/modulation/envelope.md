---
title: Envelope
setup: |
  import { Markdown } from 'astro/components';
  import Layout from '../../../layouts/MainLayout.astro';
  import EnvelopePlay from './Envelope.astro';
---

The idea of an envelope is borrowed from [sound synthesis](https://en.wikipedia.org/wiki/Envelope_(music)). Envelopes are useful for modulating a value over time, allowing for more complex dynamics than a simple decay function might provide.

## Concept

The envelope consists of a series of stages, typically _attack, decay, sustain_ and _release_. 
* All stages have an associated _level_ or _amplitude_
* All of the stages except _sustain_ have a _duration_, how long they run for.

When a synth key is pressed, the _attack_ stage runs for its specified duration, after which the _decay_ stage runs. The _sustain_ stage runs for as long as the key is held. At any point when the key is released, the _release_ stage runs.

As a stage progresses, it is essentially interpolating from the the starting level to its own. For example, during the attack stage, it might interpolate from 0 (off) to 1 (full on). 

In ixfx, interpolation for each stage happens using a curve, allowing for more expressive progressions.

<envelope-editor />

## Why?

## Playground

In the playground, you can _trigger_ the envelope, which will then run through its stages. Use _Trigger & Hold_ if you want to have the envelope stop and run the sustain stage. _Release_ will then allow envelope to decay. 

<EnvelopePlay />

In the visualisation above, progress through each stage is shown in red. Progress starts at 0 and runs through to 1. The same number is shown in the log as the 'raw' value. In yellow the computed scaled value of the envelope is shown. This would be the value you'd normally use.

## Usage 
