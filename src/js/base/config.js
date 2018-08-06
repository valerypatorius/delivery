const isClient = typeof window !== 'undefined'
const dpr = (isClient && window.devicePixelRatio > 1) ? 1.5 : 1;

export default {
    name: 'DeliveryGame',
    analyticsCategory: 'Delivery Game',

    width: isClient ? window.innerWidth * dpr : 1024,
    height: isClient ? window.innerHeight * dpr : 768,
    scale: 1 / dpr,
    maxPlayerFallAngle: 75,
    gravity: 3,
    mute: true
};