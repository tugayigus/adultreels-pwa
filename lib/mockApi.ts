export interface Video {
  id: string; // Legacy numeric ID for internal use
  permanentId: string; // New 13-character alphanumeric ID for URLs
  src: string;
  poster?: string;
  title?: string;
}

const SAMPLE_VIDEOS: Video[] = [
  {
    id: '1',
    permanentId: 'a8b92cDdX01p1',
    src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    poster: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/BigBuckBunny.jpg',
    title: 'Sample Video 1'
  },
  {
    id: '2',
    permanentId: 'k7M3nP9qR5sT2', 
    src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    poster: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/ElephantsDream.jpg',
    title: 'Sample Video 2'
  },
  {
    id: '3',
    permanentId: 'h4L6wE8vY2uI3',
    src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    poster: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerBlazes.jpg',
    title: 'Sample Video 3'
  },
  {
    id: '4',
    permanentId: 'f9A1zN7mQ3xC4',
    src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    poster: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerEscapes.jpg',
    title: 'Sample Video 4'
  },
  {
    id: '5',
    permanentId: 'j2K5bG8tV6oH5',
    src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    poster: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerFun.jpg',
    title: 'Sample Video 5'
  }
];

let currentPage = 0;
const PAGE_SIZE = 3;

export const getInitialVideos = async (): Promise<Video[]> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  currentPage = 0;
  return SAMPLE_VIDEOS.slice(0, PAGE_SIZE);
};

export const getMoreVideos = async (): Promise<Video[]> => {
  await new Promise(resolve => setTimeout(resolve, 800));
  currentPage += 1;
  const startIndex = currentPage * PAGE_SIZE;
  const endIndex = startIndex + PAGE_SIZE;
  
  if (startIndex >= SAMPLE_VIDEOS.length) {
    return [];
  }
  
  return SAMPLE_VIDEOS.slice(startIndex, endIndex);
};

export const resetPagination = () => {
  currentPage = 0;
};

export const getVideoByPermanentId = async (permanentId: string): Promise<Video | null> => {
  await new Promise(resolve => setTimeout(resolve, 100));
  return SAMPLE_VIDEOS.find(video => video.permanentId === permanentId) || null;
};

export const getAllVideos = async (): Promise<Video[]> => {
  await new Promise(resolve => setTimeout(resolve, 100));
  return [...SAMPLE_VIDEOS];
};