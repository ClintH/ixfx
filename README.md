# ixfx

ixfx is a framework for sketching and prototyping interactivity. It is designed for the beginning programmer, and is optimised for readability and safety over performance.

* [Demos](https://demos.ixfx.fun/)
* [Guide](https://ixfx.fun/)
* [API Documentation](https://api.ixfx.fun/modules.html)

## Using

Please see [the guide](https://ixfx.fun/) for how to get up and running.

## Why ixfx?

There are many 'front-end' frameworks, but these are typically meant for regular GUIs or document-based apps. They usually have idiosyncratic ways of structuring code, custom syntax, and elaborate build processes. Great though if you're doing that kind of thing often.

There are also several 'creative coding' sandboxes. These are better suited than front-end frameworks for experimentation in interactivity, but again tend to be their own little ecosystem removed from the web platform. They favour Canvas-based visuals, and seem largely ignorant of the wider web platform or modern coding practices.

In both cases one spends a lot of time learning the particular framework and its way of doing things rather than the web platform itself. Learning Javascript as a language also gets lost in this. Having to ask "how do I do _x_ in React?" or "how do I do _x_ in P5.js?" is a sign the framework has eaten you.

Some principles are:
* No build process required
* No sandbox lock-in: follow web platform conventions so that patterns learned can be applied elsewhere
* Good type definitions and documentation for improved editor experience (in VS Code at least)
* Plain, immutable data over rich objects
* Favour functional approaches over OOP

## Features

ixfx offers:
* Flow: state machine, time-based delay/intervals, debounce, throttling
* Modulation: ADSR envelope, oscillators, easing functions
* Data: generators, frequency-tracking, stack and queue collections, colour functions
* Geometry: primitives for Cartesian & polar coordinates, points, lines, arcs, circles and grid layouts.

## Building

If you want to contribute to ixfx or build it yourself, please see [BUILDING.md](BUILDING.md).

## Credits

Bundles
* [Colorjs](https://colorjs.io/), [d3-color](https://github.com/d3/d3-color/) by Lea Verou, Chris Lilley et al.
* Easing functions by [Andrey Sitnik and Ivan Solovev](https://easings.net/)
* [Bezier.js](https://github.com/Pomax/bezierjs)
* [Underdash](https://surma.github.io/underdash/) by Surma