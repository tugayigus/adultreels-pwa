export interface Video {
  id: string;
  src: string;
  poster?: string;
  title?: string;
}

const SAMPLE_VIDEOS: Video[] = [
  {
    id: '1',
    src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    poster: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/BigBuckBunny.jpg',
    title: 'Sample Video 1'
  },
  {
    id: '2', 
    src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    poster: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/ElephantsDream.jpg',
    title: 'Sample Video 2'
  },
  {
    id: '3',
    src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    poster: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerBlazes.jpg',
    title: 'Sample Video 3'
  },
  {
    id: '4',
    src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    poster: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerEscapes.jpg',
    title: 'Sample Video 4'
  },
  {
    id: '5',
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