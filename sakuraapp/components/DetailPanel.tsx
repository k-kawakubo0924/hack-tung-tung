import React, { useState, useRef } from 'react';
import { Location, Photo, BloomStatusLabel } from '../types';
import { Camera, X, Upload, Sparkles, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { analyzeSakuraPhoto } from '../services/geminiService';

interface DetailPanelProps {
  location: Location | null;
  isOpen: boolean;
  onClose: () => void;
  onAddPhoto: (locationId: string, photo: Photo) => void;
}

export const DetailPanel: React.FC<DetailPanelProps> = ({ location, isOpen, onClose, onAddPhoto }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [analysisText, setAnalysisText] = useState<string>('');
  const [generatedHaiku, setGeneratedHaiku] = useState<string>('');
  const [isRejected, setIsRejected] = useState(false);

  if (!isOpen || !location) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset states
    setIsRejected(false);
    setAnalysisText("");
    setGeneratedHaiku("");

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setUploadPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUploadSubmit = async () => {
    if (!uploadPreview || !location) return;

    setIsUploading(true);
    setAnalysisText("AIが桜を判定中...");
    setGeneratedHaiku("");
    setIsRejected(false);

    try {
      // 1. Analyze with Gemini
      const analysis = await analyzeSakuraPhoto(uploadPreview);

      // Check if it is sakura
      if (!analysis.isSakura) {
        setIsUploading(false);
        setIsRejected(true);
        setAnalysisText("これは桜の写真ではないようです🌸");
        setGeneratedHaiku("別の写真を試してください");
        return;
      }

      // 2. Create Photo object
      const newPhoto: Photo = {
        id: Date.now().toString(),
        url: uploadPreview,
        timestamp: Date.now(),
        description: analysis.description,
        isAiGenerated: true,
        aiAnalysis: analysis.haiku
      };

      // 3. Update state
      onAddPhoto(location.id, newPhoto);
      setAnalysisText(analysis.description);
      setGeneratedHaiku(analysis.haiku);
      
      // Reset after delay to show result
      setTimeout(() => {
        setUploadPreview(null);
        setIsUploading(false);
        setAnalysisText("");
        setGeneratedHaiku("");
        setIsRejected(false);
      }, 4000);

    } catch (error) {
      console.error(error);
      setIsUploading(false);
      setAnalysisText("エラーが発生しました");
    }
  };

  const handleCancel = () => {
      setUploadPreview(null);
      setIsRejected(false);
      setAnalysisText("");
      setGeneratedHaiku("");
  };

  return (
    <div className={`
      fixed inset-x-0 bottom-0 md:inset-y-0 md:left-0 md:right-auto md:w-96
      bg-white shadow-2xl z-50 transition-transform duration-300 ease-in-out flex flex-col
      ${isOpen ? 'translate-y-0 md:translate-x-0' : 'translate-y-full md:translate-y-0 md:-translate-x-full'}
      rounded-t-3xl md:rounded-none md:rounded-r-3xl h-[85vh] md:h-full
    `}>
      {/* Header */}
      <div className="relative p-6 border-b border-pink-100 bg-pink-50/50 rounded-t-3xl md:rounded-none">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-sm hover:bg-gray-50 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
        
        <div className="flex items-start justify-between pr-10">
            <div>
                <h2 className="text-2xl font-bold text-gray-800 font-zen">{location.name}</h2>
                <span className="inline-block mt-2 px-3 py-1 bg-pink-100 text-pink-700 rounded-full text-sm font-medium">
                    {BloomStatusLabel[location.currentStatus]}
                </span>
            </div>
        </div>
        <p className="mt-3 text-gray-600 text-sm leading-relaxed">{location.description}</p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        
        {/* Upload Section */}
        <div className={`
            bg-white border-2 border-dashed rounded-2xl p-4 text-center transition-colors
            ${isRejected ? 'border-red-300 bg-red-50' : 'border-pink-200 hover:border-pink-300'}
        `}>
          {!uploadPreview ? (
            <div 
                onClick={() => fileInputRef.current?.click()}
                className="cursor-pointer py-4 flex flex-col items-center justify-center space-y-2"
            >
              <div className="w-12 h-12 bg-pink-50 rounded-full flex items-center justify-center text-pink-500 mb-2">
                <Camera className="w-6 h-6" />
              </div>
              <p className="text-gray-600 font-bold">写真を投稿する</p>
              <p className="text-xs text-gray-400">タップして撮影またはライブラリから選択</p>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept="image/*" 
                className="hidden" 
              />
            </div>
          ) : (
            <div className="relative">
               <div className="relative rounded-xl overflow-hidden aspect-video bg-gray-100 mb-3">
                 <img src={uploadPreview} alt="Preview" className="w-full h-full object-cover" />
                 
                 {/* Loading Overlay */}
                 {isUploading && (
                     <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white p-4">
                        <Sparkles className="w-8 h-8 animate-spin text-pink-300 mb-2" />
                        <p className="font-bold">{analysisText}</p>
                     </div>
                 )}

                 {/* Success Overlay */}
                 {generatedHaiku && !isUploading && !isRejected && (
                     <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center text-white p-4 animate-fade-in">
                        <Sparkles className="w-6 h-6 text-pink-300 mb-2" />
                        <p className="text-lg font-serif italic mb-2">「{generatedHaiku}」</p>
                        <p className="text-xs text-pink-200">AIによる解析完了</p>
                     </div>
                 )}

                 {/* Rejection Overlay */}
                 {isRejected && (
                     <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center text-white p-4 animate-fade-in">
                        <AlertCircle className="w-8 h-8 text-red-400 mb-2" />
                        <p className="font-bold text-red-100 mb-1">{analysisText}</p>
                        <p className="text-xs text-gray-300">桜のみ投稿可能です</p>
                     </div>
                 )}
               </div>
               
               {!isUploading && !generatedHaiku && (
                 <div className="flex space-x-2">
                   <button 
                     onClick={handleCancel}
                     className="flex-1 py-2 px-4 bg-gray-100 text-gray-600 rounded-lg text-sm font-bold"
                   >
                     キャンセル
                   </button>
                   {!isRejected && (
                    <button 
                        onClick={handleUploadSubmit}
                        className="flex-1 py-2 px-4 bg-pink-500 hover:bg-pink-600 text-white rounded-lg text-sm font-bold flex items-center justify-center"
                    >
                        <Upload className="w-4 h-4 mr-2" />
                        投稿する
                    </button>
                   )}
                 </div>
               )}
            </div>
          )}
        </div>

        {/* Gallery Section */}
        <div>
            <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center">
                <ImageIcon className="w-5 h-5 mr-2 text-pink-500" />
                みんなの投稿
            </h3>
            <div className="grid grid-cols-2 gap-3">
                {location.photos.length === 0 ? (
                    <div className="col-span-2 py-8 text-center text-gray-400 bg-gray-50 rounded-xl">
                        まだ写真がありません。<br/>一番乗りで投稿しましょう！
                    </div>
                ) : (
                    location.photos.map((photo) => (
                        <div key={photo.id} className="group relative break-inside-avoid mb-2">
                            <div className="aspect-square rounded-xl overflow-hidden bg-gray-200">
                                <img src={photo.url} alt="User upload" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                            </div>
                            {(photo.description || photo.aiAnalysis) && (
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3 rounded-xl">
                                    <p className="text-white text-xs line-clamp-2">{photo.description}</p>
                                    {photo.aiAnalysis && (
                                        <p className="text-pink-200 text-[10px] mt-1 italic font-serif">
                                            {photo.aiAnalysis}
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
      </div>
    </div>
  );
};
