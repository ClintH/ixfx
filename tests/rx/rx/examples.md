
# Switcher

```js
const btnClicks = Reactive.event(document.getElementById(`btnClick`), `click`);
const btnClicksChunk = Reactive.chunk(btnClicks, { elapsed: 200});
const btnClickSwitch= Reactive.switcher(btnClicksChunk, {
  single: v=> v.length == 1,
  double: v=> v.length == 2,
  more: v=>v.length > 2
});
btnClickSwitch.single.on(msg => {
  console.log(`single!`);
});
btnClickSwitch.double.on(msg => {
  console.log(`double!`);
});
```

# Count

```js
const btnClicks = Reactive.event(document.getElementById(`btnClick`), `click`);
const btnClicksChunk = Reactive.chunk(btnClicks, { elapsed: 200});
const btnClickCount = Reactive.transform(btnClicksChunk, v=>v.length);
btnClickCount.on(msg => {
  console.log(msg.value); // 1, 2, ...
})
```