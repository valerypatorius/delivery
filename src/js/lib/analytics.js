import { analyticsCategory } from '../config.js';

const CONSOLE_STYLE = 'color: #E87E04';

/**
 * Send analytics events via GTM
 * @param {String} label  - event label
 * @param {String} action - event action ("Click" by default)
 */
export const sendEvent = (label, action = 'Click') => {

    let value = `${analyticsCategory} Stratum — ${label} — ${action}`;

    if (!IS_PRODUCTION) {
        console.log(`Analytics: %c${value}`, CONSOLE_STYLE);
    }

    if (window.dataLayer !== undefined && analyticsCategory) {

        window.dataLayer.push({
            event: 'data_event',
            data_description: value
        });

    }

};