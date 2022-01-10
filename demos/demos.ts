export type DemoOpts = {
  intervalMs?:number
  run:()=>void
  onStarted?:()=>void
  onStopped?:()=>void
  onReset?:()=>void
}

export const demoRun = (opts: DemoOpts) => {
  let producerId = 0;
  const {intervalMs = 1000, onStopped, onStarted, run, onReset} = opts;

  const _start = () => {
    if (producerId !== 0) return;
    if (onStarted) onStarted();
    producerId = window.setInterval(run, intervalMs);
  };

  const _stop = () => {
    if (producerId === 0) return;
    window.clearInterval(producerId);
    producerId = 0;
    if (onStopped) onStopped();
  };

  _start();

  document.getElementById(`btnStart`)?.addEventListener(`click`, _start);
  document.getElementById(`btnStop`)?.addEventListener(`click`, _stop);
  if (onReset) document.getElementById(`btnReset`)?.addEventListener(`click`, onReset);
};