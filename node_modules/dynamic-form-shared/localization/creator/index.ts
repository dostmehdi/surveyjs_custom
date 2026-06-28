export const creatorLocalization = {
  changeCurrentLocale: (locale: string) => {
    console.debug(`creator locale changed to ${locale}`);
  },
  isDisposed: false,
  dispose: () => {
    console.debug('creatorLocalization disposed');
  }
};
