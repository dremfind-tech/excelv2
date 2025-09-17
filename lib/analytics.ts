export const analytics = {
  track: (event: string, props?: Record<string, unknown>) => {
    if (process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.log(`[analytics] ${event}`, props ?? {});
    }
  },
};

