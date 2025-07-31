
Consuming the package:

```js
import { interpolate } from "https://unpkg.com/@ixfx/numbers/bundle";
Or: import { interpolate } from "@ixfx/numbers";

// Returns the value 50% between 1024 and 2310 (ie. 1667)
interpolate(0.5, 1024, 2310);
```

Or to import the whole package:

```js
import * as Numbers from "https://unpkg.com/@ixfx/numbers/bundle";
Or: import * Numbers from "@ixfx/numbers";

// Returns the value 50% between 1024 and 2310 (ie. 1667)
Numbers.interpolate(0.5, 1024, 2310);
```