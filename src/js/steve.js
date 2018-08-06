import States from './base/states';

import Request from './lib/request';
import { getRandomNumber } from './lib/helper';

class Steve {
    constructor() {
        this.genesis = window.__genesisHash;
        this.sessionId = window.__sessionId;
        this.isReady = false;

        this.startTime = null;
        this.endTime = null;
        this.interval = 3000;
        this.packageData = {};

        this.keys = '';

        this.checkInitialData();
    }

    checkInitialData() {
        if (this.genesis && this.sessionId) {
            this.isReady = true;
        } else {
            throw new Error('Missing initial data');
        }
    }

    init() {
        this.startTime = this.now();
    }

    reset() {
        this.keys = '';
    }

    rememberKeyPress(str) {
        this.keys += str;
    }

    formPackage(score) {
        this.endTime = this.now();

        this.packageData = {
            sessionId: this.sessionId,
            keys: this.keys,
            genesis: this.genesis,
            startTime: this.startTime,
            endTime: this.endTime,
            isLast: States.stopped,
            score
        };

        this.keys = '';
        this.startTime = this.endTime;

        this.calculateHash(this.packageData, (hash, bounce) => {
            this.packageData.hash = hash;
            this.packageData.bounce = bounce;

            this.genesis = hash;

            Request('/special/genius/sendAliby', 'POST', this.packageData).then(() => {
                console.log('Sent', this.packageData);
            }).catch(() => {
                console.log('Not sent', this.packageData);
            });
        });
    }

    async calculateHash(packageData, callback) {
        let bounce = null;
        let newHash = '';

        while (newHash.charAt(0) !== '0') {
            bounce = getRandomNumber(0, 999999999);
            newHash = await this.encode(packageData.genesis + packageData.keys + bounce + packageData.startTime + packageData.endTime);
        }

        callback(newHash, bounce);
    }

    now() {
        return Math.round(new Date().getTime());
    }

    encode(str) {
        let buffer = new TextEncoder('utf-8').encode(str);

        return crypto.subtle.digest('SHA-256', buffer).then(hash => {
            return this.hex(hash);
        });
    }

    hex(buffer) {
        let hexCodes = [];
        let view = new DataView(buffer);
        for (let i = 0; i < view.byteLength; i += 4) {
            let value = view.getUint32(i);
            let stringValue = value.toString(16);

            let padding = '00000000';
            let paddedValue = (padding + stringValue).slice(-padding.length);
            hexCodes.push(paddedValue);
        }

        return hexCodes.join('');
    }

}

let steve = new Steve();

export default steve;