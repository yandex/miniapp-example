const GEOLOCATIONS_OPTIONS = {
    timeout: 10000,
    maximumAge: 60 * 60 * 1000,
};

export async function getCurrentPosition(): Promise<Coordinates> {
    return new Promise((resolve, reject) => {
        const resolveCallback = (position: Position) => resolve(position.coords);

        window.navigator.geolocation.getCurrentPosition(resolveCallback, reject, GEOLOCATIONS_OPTIONS);
    });
}

function deg2rad(deg: number) {
    return deg * (Math.PI / 180);
}

// http://en.wikipedia.org/wiki/Haversine_formula
export function getDistanceBetweenPoints(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Радиус земли в КМ

    const tmp =
        Math.sin(deg2rad(lat2 - lat1) / 2) * Math.sin(deg2rad(lat2 - lat1) / 2) +
        Math.cos(deg2rad(lat1)) *
            Math.cos(deg2rad(lat2)) *
            Math.sin(deg2rad(lon2 - lon1) / 2) *
            Math.sin(deg2rad(lon2 - lon1) / 2);

    return 2 * R * Math.asin(Math.sqrt(tmp));
}
