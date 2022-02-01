---
title: State Machine
setup: |
  import { Markdown } from 'astro/components';
  import Layout from '../../layouts/MainLayout.astro';
  import StateMachinePlay from './StateMachinePlay.astro';

---

A _state machine_ allows for a controlled change from one state to another. It sets up a well-defined set of possible states and what transitions are possible between them. It's up to you to 'drive' the machine, telling it when to transition. 

State machines can be defined using a plain object, with keys the list of possible states, and the values state(s) that are possible to change to, or null if no further changes are possible.

## Machine definition

A simple state machine is a light switch, it has two states: _on_ and _off_. When the light is _on_, the only other state is _off_. And vice-versa:

```js
{
  "on": "off",
  "off": "on"
}
```

With this machine definition, it would be illegal to have a state `dimmed`, or to turn it `off` when it is already `off`. In this case, the machine never reaches a final state, it can always oscillate between `on/off`. Note too that we can safely automatically advance the state of the machine, because it knows what the next state will always be.

It's possible to have several possible next states by using a string array:

```js
{
  "on": ["off", "half-bright"],
  "half-bright": ["on", "off"],
  "off": "on"
}
```

The example below starts with `plain` bread and there are many subsequent states for the bread to be in. Some states can be reached from different prior states, and there are two possible final states (`sprinkled-on-soup` and `eaten`). Once a machine is in its final state, it cannot change to another state without being _reset_.

```js
{
  "plain": ["toasted", "buttered", "eaten"],
  "toasted": ["buttered", "eaten", "diced"],
  "buttered": ["eaten", "marmaladed"],
  "marmaladed": "eaten",
  "diced": "sprinkled-on-soup",
  "sprinkled-on-soup": null,
  "eaten": null
}
```

## Why?

Behaving according to a current state is a common pattern in programming interactivity. This is often solved by using different variables track state. The downside is that you have to be mindful what variables contribute to state, when and where to enforce rules about state changes. It can also be hard to keep track of all possible states.

A state machine therefore can help you catch errors and makes coding simpler when you know there are a fixed number of well-defined states to handle.

## Playground

Try out some state machines in this playground. Edit the description or load a demo, click _Set_ to load it and check for errors. If successful, you can see available states and change state under _Control_.

<StateMachinePlay />

## Usage

Create the machine with the an initial state and its _description_:

```js
const machine = new StateMachine(initialState, description);
```

The machine description is a simple object that 1) lists all possible states (as its top-level properties), and 2) for each state, what other state(s) can be transitioned to, or `null` if it is a final state.

The following example has four possible states (`wakeup, sleep, coffee, breakfast, bike`). `sleep` can only transition to the `wakeup` state, while `wakeup` can transition to either `coffee` or `breakfast`. 

Use `null` to signify the final state. Multiple states can terminate the machine if desired.

```js
const description = { 
 sleep: 'wakeup',
 wakeup: ['coffee', 'breakfast'],
 coffee: `bike`,
 breakfast: `bike`,
 bike: null
}
const machine = new StateMachine(`sleep`, description);
```

### Changing state

Change the state by name:

```js
machine.state = `wakeup`
```

Or request an automatic transition (will use first state if there are several options)

```js
machine.next();
```

Reset the machine back to its initial state:

```js
machine.reset();
```

### Status

Check status

```js
if (machine.state === `coffee`) ...
if (machine.isDone) ...
```

The `change` event is fired whenever state changes, and `stop` when the machine reaches an end.

```js
machine.addEventListener(`change`, (evt) => {
 console.log(`State change from ${evt.priorState} -> ${evt.newState}`);
});
machine.addEventListener(`stop`, (evt) => {
 console.log(`Machine has finished in state: ${evt.newState}`);
});
```



