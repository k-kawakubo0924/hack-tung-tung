import React, { useState, useRef } from 'react';
import { Location, Photo, BloomStatusLabel, User } from '../types';
import { Camera, X, Upload, Image as ImageIcon, Heart, User as UserIcon } from 'lucide-react';

interface DetailPanelProps {
  location: Location | null;
  isOpen: boolean;
  currentUser: User | null;
  onClose: () => void;
  onAddPhoto: (locationId: string, photo: Photo) => void;
  onRequireAuth: () => void;
  onLikePhoto: (locationId: string, photoId: string) => void;
}

export const DetailPanel: React.FC<DetailPanelProps> = ({ 
  location, 
  isOpen, 
  currentUser,
  onClose, 
  onAddPhoto, 
  onRequireAuth,
  onLikePhoto
}) => {
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);
  const [comment, setComment] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen || !location) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!currentUser) {
      onRequireAuth();
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    const file = e.target.files?.[0];
    if (!file) return;

    // Reset states
    setComment("");

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setUploadPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUploadSubmit = () => {
    if (!uploadPreview || !location || !currentUser) return;

    // Create Photo object
    const newPhoto: Photo = {
      id: Date.now().toString(),
      url: uploadPreview,
      timestamp: Date.now(),
      description: comment,
      isAiGenerated: false,
      likes: [],
      userId: currentUser.id,
      userName: currentUser.username
    };

    // Update state
    onAddPhoto(location.id, newPhoto);
    
    // Reset
    setUploadPreview(null);
    setComment("");
  };

  const handleCancel = () => {
      setUploadPreview(null);
      setComment("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
  };

  const handleLikeClick = (photoId: string) => {
    if (!currentUser) {
      onRequireAuth();
      return;
    }
    onLikePhoto(location.id, photoId);
  };

  const containerClasses = [
    "fixed inset-x-0 bottom-0 md:inset-y-0 md:left-0 md:right-auto md:w-96",
    "bg-white shadow-2xl z-50 transition-transform duration-300 ease-in-out flex flex-col",
    isOpen ? 'translate-y-0 md:translate-x-0' : 'translate-y-full md:translate-y-0 md:-translate-x-full',
    "rounded-t-3xl md:rounded-none md:rounded-r-3xl h-[85vh] md:h-full"
  ].join(" ");

  const uploadBoxClasses = [
    "bg-white border-2 border-dashed rounded-2xl p-4 text-center transition-colors border-pink-200 hover:border-pink-300"
  ].join(" ");

  return (
    <div className={containerClasses}>
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
        <div className={uploadBoxClasses}>
          {!uploadPreview ? (
            <div 
                onClick={() => {
                  if (!currentUser) {
                    onRequireAuth();
                  } else {
                    fileInputRef.current?.click();
                  }
                }}
                className="cursor-pointer py-4 flex flex-col items-center justify-center space-y-2"
            >
              <div className="w-12 h-12 bg-pink-50 rounded-full flex items-center justify-center text-pink-500 mb-2">
                <Camera className="w-6 h-6" />
              </div>
              <p className="text-gray-600 font-bold">写真を投稿する</p>
              <p className="text-xs text-gray-400">
                {currentUser ? 'タップして撮影またはライブラリから選択' : '投稿するにはログインしてください'}
              </p>
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
               </div>
               
               <div className="mb-3">
                 <textarea
                   value={comment}
                   onChange={(e) => setComment(e.target.value)}
                   placeholder="一言コメントを入力（任意）"
                   className="w-full p-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 resize-none"
                   rows={2}
                 />
               </div>

               <div className="flex space-x-2">
                 <button 
                   onClick={handleCancel}
                   className="flex-1 py-2 px-4 bg-gray-100 text-gray-600 rounded-lg text-sm font-bold"
                 >
                   キャンセル
                 </button>
                 <button 
                    onClick={handleUploadSubmit}
                    className="flex-1 py-2 px-4 bg-pink-500 hover:bg-pink-600 text-white rounded-lg text-sm font-bold flex items-center justify-center"
                 >
                    <Upload className="w-4 h-4 mr-2" />
                    投稿する
                 </button>
               </div>
            </div>
          )}
        </div>

        {/* Gallery Section */}
        <div>
            <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center">
                <ImageIcon className="w-5 h-5 mr-2 text-pink-500" />
                みんなの投稿
            </h3>
            <div className="flex flex-col space-y-4">
                {location.photos.length === 0 ? (
                    <div className="py-8 text-center text-gray-400 bg-gray-50 rounded-xl">
                        まだ写真がありません。<br/>一番乗りで投稿しましょう！
                    </div>
                ) : (
                    location.photos.map((photo) => {
                      const isLiked = currentUser ? photo.likes.includes(currentUser.id) : false;
                      const likeCount = photo.likes.length;

                      return (
                        <div key={photo.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="relative aspect-video bg-gray-200">
                                <img src={photo.url} alt="User upload" className="w-full h-full object-cover" />
                                {photo.aiAnalysis && (
                                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                                    <p className="text-pink-100 text-xs italic font-serif">
                                        "{photo.aiAnalysis}"
                                    </p>
                                  </div>
                                )}
                            </div>
                            
                            <div className="p-3">
                              <div className="flex items-start justify-between">
                                <p className="text-gray-700 text-sm mb-2 flex-1">{photo.description}</p>
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleLikeClick(photo.id);
                                  }}
                                  className={`flex flex-col items-center justify-center ml-2 p-1 rounded-lg transition-colors ${isLiked ? 'text-pink-500' : 'text-gray-400 hover:bg-pink-50'}`}
                                >
                                  <Heart className={`w-6 h-6 ${isLiked ? 'fill-current' : ''}`} />
                                  <span className="text-xs font-bold mt-0.5">{likeCount}</span>
                                </button>
                              </div>

                              <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-50">
                                <div className="flex items-center text-gray-400 text-xs">
                                  <UserIcon className="w-3 h-3 mr-1" />
                                  <span>{photo.userName || 'ゲストユーザー'}</span>
                                </div>
                                <span className="text-gray-300 text-xs">
                                  {new Date(photo.timestamp).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                        </div>
                      );
                    })
                )}
            </div>
        </div>
      </div>
    </div>
  );
};