// One local deadline timer; no API polling. Comparisons use UTC instants.
export function createExpirationClock(onExpire, {
  now = Date.now, schedule = setTimeout, cancel = clearTimeout,
} = {}) {
  let timer;
  return {
    update(records) {
      if (timer !== undefined) cancel(timer);
      timer = undefined;
      const current = now();
      const ends = records.map(event => Date.parse(event.end || event.start))
        .filter(end => Number.isFinite(end) && end > current);
      if (ends.length) timer = schedule(() => {timer = undefined; onExpire();},
        Math.min(Math.min(...ends) - current, 2_147_483_647));
    },
    stop() {if (timer !== undefined) cancel(timer); timer = undefined;},
  };
}
