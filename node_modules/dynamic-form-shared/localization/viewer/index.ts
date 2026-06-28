export const viewerLocalization = {
  changeCurrentLocale: (locale: string) => {
    console.debug(`viewer locale changed to ${locale}`);
  },
  isDisposed: false,
  dispose: () => {
    console.debug('viewerLocalization disposed');
  }
};
