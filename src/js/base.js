import Config from './config';

/**
 * Base stratum constructor with common methods
 */
class BaseStratum {

    constructor() {
        this.params = {};
        this.saveParams();
    }

    /**
     * Save custom params
     * @param {Object} params - params object with custom values
     */
    saveParams() {
        Object.assign(this.params, Config);
    }

    /**
     * Load css file
     * @param {String} path
     */
    loadStyles(path) {
        return new Promise(resolve => {
            let link = document.createElement('link');

            link.rel = 'stylesheet';
            link.href = path;

            link.onload = () => resolve();

            document.body.appendChild(link);
        });
    }

}

export default BaseStratum;