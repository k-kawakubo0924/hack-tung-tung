import { Location, BloomStatusLabel } from './types';
import { Cherry, MapPin, Wind, Sun, CloudRain } from 'lucide-react';
import React from 'react';

export const MOCK_LOCATIONS: Location[] = [
  {
    id: '1',
    name: '舞鶴公園 (福岡市)',
    lat: 33.5848,
    lng: 130.3833,
    description: '福岡城跡にある市内有数の桜の名所。お堀の水面に映る桜が見事です。約1,000本の桜が咲き誇ります。',
    currentStatus: 'mankai',
    photos: [
      { 
        id: 'p1', 
        url: 'https://picsum.photos/id/112/400/300', 
        timestamp: Date.now() - 100000, 
        description: '石垣と桜のコントラストが美しい。',
        likes: [],
        userName: 'HanamiMaster'
      }
    ]
  },
  {
    id: '2',
    name: '小倉城 (北九州市)',
    lat: 33.8847,
    lng: 130.8736,
    description: '復元された天守閣と桜のコントラストが美しい、北九州を代表する名所。約300本の桜が城を彩ります。',
    currentStatus: 'saki-hajime',
    photos: []
  },
  {
    id: '3',
    name: '太宰府天満宮',
    lat: 33.5215,
    lng: 130.5349,
    description: '学問の神様として有名。境内や周辺の山々が桜色に染まります。梅だけでなく桜も楽しめます。',
    currentStatus: 'chiri-hajime',
    photos: []
  },
  {
    id: '4',
    name: '秋月城跡 (朝倉市)',
    lat: 33.4660,
    lng: 130.6934,
    description: '「筑前の小京都」と呼ばれる情緒ある城下町。黒門周辺の桜のトンネル（杉の馬場）は絶景です。',
    currentStatus: 'mankai',
    photos: []
  },
  {
    id: '5',
    name: '浅井の一本桜',
    lat: 33.3081,
    lng: 130.6385,
    description: '樹齢約100年のヤマザクラ。ため池に逆さに映る「逆さ桜」が幻想的で、写真愛好家に人気です。',
    currentStatus: 'tsubomi',
    photos: []
  },
  {
    id: '6',
    name: '白野江植物公園',
    lat: 33.9458,
    lng: 130.9575,
    description: '早咲きから遅咲きまで約60種もの桜があり、長い期間お花見が楽しめます。',
    currentStatus: 'mankai',
    photos: []
  },
  {
    id: '7',
    name: '流川の桜並木',
    lat: 33.3421,
    lng: 130.7699,
    description: '巨瀬川沿いに約2km続く桜並木。約1000本の桜によるトンネルは圧巻です。',
    currentStatus: 'saki-hajime',
    photos: []
  }
];

export const STATUS_COLORS: Record<keyof typeof BloomStatusLabel, string> = {
  tsubomi: '#22c55e', // green-500
  'saki-hajime': '#f9a8d4', // pink-300
  mankai: '#ec4899', // pink-500
  'chiri-hajime': '#fbcfe8', // pink-200
  hazakura: '#15803d', // green-700
};

export const STATUS_ICONS: Record<keyof typeof BloomStatusLabel, React.ReactNode> = {
  tsubomi: <div className="w-4 h-4 rounded-full bg-green-500 border-2 border-white" />,
  'saki-hajime': <div className="w-4 h-4 rounded-full bg-pink-300 border-2 border-white" />,
  mankai: <Cherry className="w-5 h-5 text-pink-600 fill-pink-200" />,
  'chiri-hajime': <Wind className="w-4 h-4 text-pink-300" />,
  hazakura: <div className="w-4 h-4 rounded-full bg-green-700 border-2 border-white" />,
};