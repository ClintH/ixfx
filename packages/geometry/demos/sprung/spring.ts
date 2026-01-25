import { Point, Points } from "../../dist/index";

export function interpolator(a: Point, b: Point, options: Partial<SpringOptions> = {}) {


  let travelRaw = Points.subtract(a, b);
  let travel = Points.abs(travelRaw);
  const springConstant = options.springK ?? 120;
  const damping = options.damping ?? 20
  const mass = options.mass ?? 1;

  let velocity = Points.Empty;

  const compute = (t: number) => {
    let x = sprungResponseRaw(t, travel.x, velocity.x, springConstant, damping, mass);
    let y = sprungResponseRaw(t, travel.y, velocity.y, springConstant, damping, mass);
    velocity = {
      x: x.velocity,
      y: y.velocity
    }
    travel = {
      x: x.position,
      y: y.position
    }
    console.log(`t: ${ t.toFixed(2) } x: ${ x.position.toFixed(2) } y: ${ y.position.toFixed(2) }`)
    let p = {
      x: a.x + x.position,
      y: a.y + y.position
    }
    // if (travelRaw.x < 0) {
    //   p.x = a.x - x.position;
    // }
    // if (travelRaw.y < 0) {
    //   p.y = a.y - y.position;
    // }


    return p;
  }
  return compute;
}

export type SpringOptions = {
  springK: number,
  damping: number
  mass: number
}

export function springStateful(options: Partial<SpringOptions> = {}) {
  const springConstant = options.springK ?? 2000;
  const damping = options.damping ?? 2
  const mass = options.mass ?? 1;
  let p = 1;
  let v = 0;
  const compute = (t: number) => {
    const r = sprungResponseRaw(t, p, v, springConstant, damping, mass);

    p = r.position;
    v = r.velocity;
    return p;
  }
  return compute;
}

export function sprungResponseRaw(
  time: number,
  initialPos: number, //d
  initialVelo: number, // v
  springConstant: number, // k 
  dampingCoefficient: number, //c
  mass: number // m
): { position: number; velocity: number } {
  const decay = dampingCoefficient / 2 / mass;
  const omega = Math.sqrt(springConstant / mass);
  const resid = decay * decay - omega * omega;
  const scale = Math.sqrt(Math.abs(resid));

  let T1 = time;
  let T0 = 1;

  if (resid < 0) {
    T1 = Math.sin(scale * time) / scale;
    T0 = Math.cos(scale * time);
  } else if (resid > 0) {
    T1 = Math.sinh(scale * time) / scale;
    T0 = Math.cosh(scale * time);
  }

  const dissipation = Math.exp(-decay * time);

  const position =
    dissipation * (initialPos * (T0 + T1 * decay) + initialVelo * T1);

  const velocity =
    dissipation * (initialPos * (-T1 * omega * omega) + initialVelo * (T0 - T1 * decay));

  return { position, velocity };
}
