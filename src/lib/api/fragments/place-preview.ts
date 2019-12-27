import { CityPreview } from './city-preview';
import { Coordinates } from './coordinates';
import { Metro } from './metro';

export type PlacePreview = {
    id: string;
    title: string | null;
    address: string | null;
    type: {
        name: string;
    };
    city: CityPreview | null;
    metro: Metro[];
    coordinates: Coordinates | null;
};
