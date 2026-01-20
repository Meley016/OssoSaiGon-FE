let count = 0;
let listener = null;

export const loadingManager = {
  bind(fn) {
    listener = fn;
  },

  start() {
    count++;
    listener?.(true);
  },

  stop() {
    count = Math.max(0, count - 1);
    if (count === 0) {
      listener?.(false);
    }
  },
};
