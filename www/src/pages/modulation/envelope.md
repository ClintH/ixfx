---
title: Envelope
setup: |
  import { Markdown } from 'astro/components';
  import Layout from '../../layouts/MainLayout.astro';
  import EnvelopePlay from './Envelope.astro';
---

The notion of an _envelope_ is borrowed from [sound synthesis](https://en.wikipedia.org/wiki/Envelope_(music)). They are useful for modulating a value after an initial trigger, with simple means for describing the shape of the modulation.

## Stages

The envelope consists of a series of stages, typically _attack, decay, sustain_ and _release_. 
* All stages have an associated _level_ or _amplitude_. Attack's level is also known as the _initial level_, and decay's level is also known as the _peak level_.
* All stages except _sustain_ have a _duration_, how long they run for in milliseconds.

When a trigger happens (eg a synth key is pressed), the _attack_ stage runs for its specified duration, after which the _decay_ stage runs. The _sustain_ stage runs for as long as the trigger is held. At any point when the key is released, the _release_ stage runs.

As a stage progresses, it is essentially interpolating from its start to end point. Internally, each stage is modelled as running from 0 to 1, but this is scaled according to the levels you define. 

Envelopes can also loop through the attack, decay and release stages whilst being triggered. In this case, the sustain stage is skipped.

In ixfx, interpolation for each stage happens using a simple curve, allowing for more expressive progressions with the _bend_ parameter.

<envelope-editor id="envEditor" />

## Why?

## Playground

The playground uses the settings from the envelope editor above. You can _trigger_ the envelope, which will then run through its stages. Use _Trigger & Hold_ if you want to have the envelope hold at the sustain stage. _Release_ allows a held envelope to continue on to the release stage. 

<EnvelopePlay />

## Usage 
