export const creatorLocalization = {
    changeCurrentLocale: (locale) => {
        console.debug(`creator locale changed to ${locale}`);
    },
    isDisposed: false,
    dispose: () => {
        console.debug('creatorLocalization disposed');
    }
};
