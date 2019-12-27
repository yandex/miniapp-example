import { MediaImageSize } from './image-size';

export type GalleryImage = {
    bgColor: string | null;
    thumbnail: MediaImageSize;
    thumbnail2x: MediaImageSize;
    large: MediaImageSize;
    large2x: MediaImageSize;
};
