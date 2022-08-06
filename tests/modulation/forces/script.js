import {Forces} from '../../../dist/modulation.js';
import {Drawing, Colour} from '../../../dist/visual.js';
import {continuously, repeat, throttle} from '../../../dist/flow.js';
import {Triangles, Lines, Points, Rects, Shapes} from '../../../dist/geometry.js';
import { Oscillators } from '../../../dist/modulation.js';

const circle = (a, ctx, bounds, radius = 10, fillStyle = `black`) => {
  if (a === undefined) throw new Error(`a is undefined`);
  const pt = Points.multiply(a.position, bounds);
  radius = 5 + (radius * (a.mass ?? 1));
  ctx.save();
  ctx.translate(pt.x, pt.y);
  ctx.fillStyle = fillStyle;
  ctx.beginPath();
  ctx.ellipse(-radius / 2, -radius / 2, radius, radius, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

const arrowFromTip = (a, ctx, bounds) => {
  const pt = Points.multiply(a.position, bounds);

  const opts = {
    angleRadian: a.angle,
    tailThickness: 5
  }
  const arrow = Shapes.arrow({x: 0, y: 0}, `tip`, opts);
  ctx.save();
  ctx.translate(pt.x, pt.y);

  Drawing.connectedPoints(ctx, arrow, {strokeStyle: `firebrick`, loop: true});

  ctx.restore();
}

const attractionTest = () => {
  const el = document.getElementById(`attractRepulse`);
  const bounds = {width: 500, height: 200};

  const generate = () => ({
    position: Points.random(),
    mass: Math.random() / 20,
    angle: Math.PI,
    angularAcceleration: 0
  });

  let attractor = {
    position: {x: 0.5, y: 0.5},
    mass: 1,
    angle: Math.random() * Math.PI * 2
  };

  let attractees = repeat(20, generate);

  /** @type {CanvasRenderingContext2D} */
  const ctx = el.getContext(`2d`);

  const angularForce = Forces.angularForce();
  const angleFromAccelerationForce = Forces.angleFromAccelerationForce();
  const angleFromVelocityForce = Forces.angleFromVelocityForce(0.5);

  const gravity = 0.005;
  continuously(() => {
    ctx.fillStyle = `gold`;
    ctx.fillRect(0, 0, bounds.width, bounds.height);

    // Apply forces: all attractees, one attractor
    attractees = attractees.map(a => Forces.apply(a,
      Forces.computeAttractionForce(attractor, a, gravity),
      angleFromAccelerationForce,
      angularForce,
      angleFromVelocityForce
    ));

    // Make attractess work on each other too
    const f = Forces.attractionForce(attractees, gravity);
    attractees = attractees.map(a => Forces.apply(a, f));

    attractees.forEach(a => {
      arrowFromTip(a, ctx, bounds);
    });

    circle(attractor, ctx, bounds, 15, `LightGoldenrodYellow`);
  }).start();

  el.addEventListener(`click`, (ev) => {
    attractor = {
      ...attractor,
      position: Points.divide({x: ev.offsetX, y: ev.offsetY}, bounds),
    };
  });
};

const basicTest = () => {
  const el = document.getElementById(`basic`);

  const bounds = {width: 500, height: 200};
  const thing = {
    position: {x: 0.1, y: 0},
    velocity: {x: 0.0, y: 0},
    mass: 1
  };

  // In relative coordintes
  const liquid = {
    width: 1,
    height: 0.5,
    x: 0,
    y: 0.5
  }

  /** @type {CanvasRenderingContext2D} */
  const ctx = el.getContext(`2d`);

  // Wind adds acceleration. Force is dampened by mass
  const wind = Forces.accelerationForce({x: 0.00001, y: 0}, `dampen`);

  // Gravity adds acceleration. Force is magnified by mass
  const gravity = Forces.accelerationForce({x: 0, y: 0.0001}, `multiply`);

  // Friction is calculated based on velocity. Force is magnified by mass
  const friction = Forces.velocityForce(0.00001, `multiply`);

  // Flip movement velocity if we hit a wall. And dampen it by 10%
  const bouncer = Forces.constrainBounce({width: 1, height: 1}, 0.9);

  // Drag 
  const drag = Forces.magnitudeForce(0.1, `dampen`);

  let t = thing;
  continuously(() => {
    ctx.fillStyle = `pink`;
    ctx.fillRect(0, 0, bounds.width, bounds.height);

    ctx.fillStyle = `IndianRed`;
    const rectAbs = Rects.multiply(liquid, bounds);
    ctx.fillRect(rectAbs.x, rectAbs.y, rectAbs.width, rectAbs.height);

    // Apply functions...
    t = Forces.apply(t,
      gravity,
      Rects.intersectsPoint(liquid, t.position) ? null : wind,
      friction,
      Rects.intersectsPoint(liquid, t.position) ? drag : null,
      bouncer
    );

    ctx.fillStyle = `Brown`;
    const pt = Points.multiply(t.position, bounds);
    ctx.beginPath();
    ctx.ellipse(pt.x, pt.y, 10, 10, 0, 0, Math.PI * 2);
    ctx.fill();
  }).start();

  el.addEventListener(`click`, (ev) => {
    t = {
      position: Points.divide({x: ev.offsetX, y: ev.offsetY}, bounds),
      velocity: {x: 0, y: 0},
    };
  });
}

const pendulumTest = () => {
  const el = document.getElementById(`pendulum`);
  /** @type {CanvasRenderingContext2D} */
  const ctx = el.getContext(`2d`);

  const bounds = {width: 300, height: 300};
  const thing = {
    position: {x: 1, y: 0.5},
    mass: 0.1
  };
  const pinnedAt = {x: 0.5, y: 0.5};

  const pendulumForce = Forces.pendulumForce(pinnedAt);
  const springForce = Forces.springForce(pinnedAt, 0.2);

  let pause = false;
  let t = thing;
  continuously(() => {
    ctx.fillStyle = `SkyBlue`;
    ctx.fillRect(0, 0, bounds.width, bounds.height);

    if (!pause) {
      t = Forces.apply(t,
        springForce,
        pendulumForce,
        
      );
    }

    const pt = Points.multiply(t.position, bounds);
    const pt2 = Points.multiply(pinnedAt, bounds);

    Drawing.line(ctx, {a: pt, b: pt2}, {strokeStyle: `SlateGray`, lineWidth: 2});

    ctx.fillStyle = `MidnightBlue`;
    ctx.beginPath();
    ctx.ellipse(pt.x, pt.y, 10, 10, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = `SlateGrey`;

    ctx.beginPath();
    ctx.ellipse(pt2.x, pt2.y, 5, 5, 0, 0, Math.PI * 2);
    ctx.fill();
  }, 2).start();

  el.addEventListener(`pointermove`, (ev) => {
    if (ev.buttons === 0) return;
    t = {
      position: Points.divide({x: ev.offsetX, y: ev.offsetY}, bounds),
      velocity: {x: 0, y: 0},
    };
  });

  el.addEventListener(`pointerdown`, (ev) => {
    pause = true;
  });


  el.addEventListener(`pointerup`, () => {
    pause = false;
  });

  el.addEventListener(`pointerleave`, () => {
    pause = false;
  });
};

const particleTest = () => {
  const agingRate = 0.98;
  const aliveThreshold = 0.001;
  const maxParticles = 100;
  const hue = 200;
  const radiusMax = 30;
  const el = document.getElementById(`particles`);
  /** @type {CanvasRenderingContext2D} */
  const ctx = el.getContext(`2d`);

  const bounds = {width: 500, height: 200};
  let pointer = { x:0.5, y: 0.5 };

  const create = () => {
    return {
      life: 1,
      acceleration: Points.multiply(Points.random(), -0.001, -0.01),
      position: pointer,
      mass: Math.random()
    };
  };

  const spawn = throttle(() => {
    if (particles.length < maxParticles) {
      particles.push(create());
    }
  }, 30);

  let particles = [create()];
  const windForce = Forces.accelerationForce({x: 0.00001, y: 0}, `dampen`);
  const gravityForce = Forces.accelerationForce({x: 0, y: 0.0001}, `multiply`);
  const frictionForce = Forces.velocityForce(0.01, `multiply`);

  continuously(() => {
    ctx.fillStyle = `hsl(${hue}, 20%, 80%)`;
    ctx.fillRect(0, 0, bounds.width, bounds.height);

    // Apply simulation to all particles
    particles = particles.map(p => {
      const withForces = Forces.apply(p,
        windForce,
        gravityForce,
        frictionForce
      );
      return {
        ...withForces,
        life: p.life * agingRate
      }
    });

    // Delete particles that are too old
    particles = particles.filter(p => p.life >= aliveThreshold);
  
    // Draw particles
    particles.forEach(p => {
      const pt = Points.multiply(p.position, bounds);
      
      ctx.save();
      ctx.translate(pt.x, pt.y);
      ctx.beginPath();

      ctx.ellipse(0, 0, radiusMax*p.mass, radiusMax*p.mass, 0, 0, Math.PI * 2);
      ctx.fillStyle = Colour.opacity(Colour.interpolate(p.life, `Red`, `Yellow`), p.life);
      ctx.fill();
      ctx.restore();
    });

  }, 2).start();

  el.addEventListener(`pointermove`, (ev) => {
    if (ev.buttons === 0) return;
    ev.preventDefault();
    pointer = Points.divide({x: ev.offsetX, y: ev.offsetY}, bounds);
    spawn();
  });
};

pendulumTest();
basicTest();
attractionTest();

particleTest();
