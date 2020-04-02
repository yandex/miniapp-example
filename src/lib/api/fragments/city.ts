export type MenuTag = {
    name: string;
    code: string;
};

export type City = {
    name: string;
    geoid: number;
    longitude: number;
    latitude: number;
    eventsMenu: MenuTag[];
};
