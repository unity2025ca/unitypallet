import { useState } from "react";
import { ProductImage } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { XCircle, Check, Play } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface MediaGalleryProps {
  productImages: ProductImage[];
  onSetMainImage: (imageId: number) => void;
  onDeleteImage: (imageId: number) => void;
}

const MediaGallery = ({ productImages, onSetMainImage, onDeleteImage }: MediaGalleryProps) => {
  const [playingVideo, setPlayingVideo] = useState<number | null>(null);

  const handleVideoPlay = (imageId: number) => {
    setPlayingVideo(imageId);
  };

  const handleVideoEnd = () => {
    setPlayingVideo(null);
  };

  const isVideo = (url: string | null) => {
    if (!url) return false;
    return url.includes('/video/') || url.match(/\.(mp4|avi|mov|wmv|webm|mkv)$/i);
  };

  const getMediaUrl = (image: ProductImage) => {
    return image.videoUrl || image.imageUrl || '';
  };

  const renderMedia = (image: ProductImage) => {
    const mediaUrl = getMediaUrl(image);
    const isVideoFile = isVideo(mediaUrl);

    if (isVideoFile) {
      return (
        <div className="relative">
          <video
            src={mediaUrl}
            className="w-full h-24 object-cover rounded"
            onError={(e) => {
              (e.target as HTMLVideoElement).src = "https://placehold.co/600x400?text=Video+Not+Available";
            }}
            controls={playingVideo === image.id}
            onPlay={() => handleVideoPlay(image.id)}
            onEnded={handleVideoEnd}
            poster={image.imageUrl || undefined}
          />
          {playingVideo !== image.id && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 rounded">
              <Play className="h-8 w-8 text-white" />
            </div>
          )}
        </div>
      );
    } else {
      return (
        <img 
          src={mediaUrl} 
          alt={`Product media ${image.id}`}
          className="w-full h-24 object-cover rounded"
          onError={(e) => {
            (e.target as HTMLImageElement).src = "https://placehold.co/600x400?text=Image+Not+Available";
          }}
        />
      );
    }
  };

  if (!productImages || productImages.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No additional media files for this product</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {productImages.map((image) => (
        <div key={image.id} className="relative border rounded-lg overflow-hidden">
          {renderMedia(image)}
          
          {/* Media type indicator */}
          <div className="absolute top-2 left-2">
            <span className={`text-xs px-2 py-1 rounded flex items-center gap-1 ${
              isVideo(getMediaUrl(image)) 
                ? 'bg-blue-500 text-white' 
                : 'bg-green-500 text-white'
            }`}>
              {isVideo(getMediaUrl(image)) && <Play className="h-3 w-3" />}
              {isVideo(getMediaUrl(image)) ? 'Video' : 'Image'}
            </span>
          </div>

          {/* Main image indicator */}
          {image.isMain && (
            <div className="absolute top-2 right-2">
              <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded">
                Main
              </span>
            </div>
          )}

          {/* Action buttons */}
          <div className="absolute bottom-2 left-2 right-2 flex justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onSetMainImage(image.id)}
              disabled={image.isMain}
              className="bg-white/80 hover:bg-white text-xs"
            >
              {image.isMain ? <Check className="h-3 w-3" /> : "Set Main"}
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDeleteImage(image.id)}
              className="bg-white/80 hover:bg-white text-xs text-red-600 hover:text-red-700"
            >
              <XCircle className="h-3 w-3" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MediaGallery;