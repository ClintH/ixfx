A simple eventing implementation.

For a class, extend `SimpleEventEmitter`.

```typescript
export type MyClassEvents = {
  // An event named `blah` that has one field, 'id'.
  readonly blah: (id:string);
};

export class MyClass extends SimpleEventEmitter<MyClassEvents> {

  test() {
    // Eg: firing an event
     this.fireEvent(`blah`, {
      id: Math.random()
    });
  }
}
```

You can then un/subscribe as usual:
```js
const c = new MyClass();
c.addEventListener(`blah`, (id) => {
  // Event!
});
```