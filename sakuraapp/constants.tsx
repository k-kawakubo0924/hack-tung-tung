import { Location, BloomStatusLabel } from './types';
import { Cherry, MapPin, Wind, Sun, CloudRain } from 'lucide-react';
import React from 'react';

export const MOCK_LOCATIONS: Location[] = [
  {
    id: '1',
    name: '舞鶴公園',
    x: 50,
    y: 55,
    description: '福岡城跡にある市内有数の桜の名所。お堀の水面に映る桜が見事です。約1,000本の桜が咲き誇ります。',
    currentStatus: 'mankai',
    photos: [
      { id: 'p1', url: 'https://picsum.photos/id/112/400/300', timestamp: Date.now() - 100000, description: '石垣と桜のコントラストが美しい。' }
    ]
  },
  {
    id: '2',
    name: '西公園',
    x: 45,
    y: 35,
    description: '「さくら名所100選」にも選ばれている、博多湾を見下ろす丘にある公園。約1,300本の桜があります。',
    currentStatus: 'saki-hajime',
    photos: []
  },
  {
    id: '3',
    name: '海の中道海浜公園',
    x: 75,
    y: 15,
    description: '広大な敷地に桜とネモフィラのコラボレーションが楽しめます。サイクリングしながらのお花見もおすすめ。',
    currentStatus: 'tsubomi',
    photos: []
  },
  {
    id: '4',
    name: '愛宕神社',
    x: 25,
    y: 45,
    description: '福岡市内を一望できる絶景スポット。夜景と夜桜の組み合わせはデートにも人気です。',
    currentStatus: 'chiri-hajime',
    photos: []
  },
  {
    id: '5',
    name: '山王公園',
    x: 65,
    y: 70,
    description: '博多駅からも近く、市民の憩いの場として親しまれている公園。子連れのお花見客で賑わいます。',
    currentStatus: 'mankai',
    photos: []
  }
];

export const STATUS_COLORS: Record<keyof typeof BloomStatusLabel, string> = {
  tsubomi: 'bg-green-500',
  'saki-hajime': 'bg-pink-300',
  mankai: 'bg-pink-500',
  'chiri-hajime': 'bg-pink-200',
  hazakura: 'bg-green-700',
};

export const STATUS_ICONS: Record<keyof typeof BloomStatusLabel, React.ReactNode> = {
  tsubomi: <div className="w-4 h-4 rounded-full bg-green-500 border-2 border-white" />,
  'saki-hajime': <div className="w-4 h-4 rounded-full bg-pink-300 border-2 border-white" />,
  mankai: <Cherry className="w-5 h-5 text-pink-600 fill-pink-200" />,
  'chiri-hajime': <Wind className="w-4 h-4 text-pink-300" />,
  hazakura: <div className="w-4 h-4 rounded-full bg-green-700 border-2 border-white" />,
};
