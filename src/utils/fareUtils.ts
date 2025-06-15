    // utils/fareUtils.ts

    export function getFareForTrip(origin: string, destination: string, busType: string): number {
    const baseFare = 20;
    const distanceFactor = origin === destination ? 1 : Math.random() * 2 + 1;

    let multiplier = 1;
    switch (busType) {
        case 'Economy':
        multiplier = 1;
        break;
        case 'Business':
        multiplier = 1.5;
        break;
        case 'VIP':
        multiplier = 2;
        break;
        default:
        multiplier = 1;
    }

    return Math.round(baseFare * distanceFactor * multiplier);
    }
