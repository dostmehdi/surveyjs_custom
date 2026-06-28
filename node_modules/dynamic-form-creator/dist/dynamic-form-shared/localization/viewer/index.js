export const viewerLocalization = {
    changeCurrentLocale: (locale) => {
        console.debug(`viewer locale changed to ${locale}`);
    },
    isDisposed: false,
    dispose: () => {
        console.debug('viewerLocalization disposed');
    }
};
