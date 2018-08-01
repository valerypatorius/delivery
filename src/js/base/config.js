let dpr = window.devicePixelRatio > 1 ? 1.5 : 1;

export default {
    name: 'DeliveryGame',
    analyticsCategory: 'Delivery Game',

    width: window.innerWidth * dpr,
    height: window.innerHeight * dpr,
    scale: 1 / dpr,
    maxPlayerFallAngle: 75,
    gravity: 2,
    mute: true
};