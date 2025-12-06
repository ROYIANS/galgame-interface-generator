import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import styles from './CropModal.module.css';

// Helper function to create the cropped image
const getCroppedImg = async (imageSrc, pixelCrop) => {
    const image = new Image();
    image.src = imageSrc;
    await new Promise((resolve) => { image.onload = resolve; });

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    ctx.drawImage(
        image,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        pixelCrop.width,
        pixelCrop.height
    );

    return new Promise((resolve) => {
        canvas.toBlob((blob) => {
            resolve(URL.createObjectURL(blob));
        }, 'image/png');
    });
};

const CropModal = ({ isOpen, imageSrc, onClose, onCropComplete }) => {
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

    // 检测是否为GIF
    const isGif = imageSrc && imageSrc.toLowerCase().includes('.gif');

    const onCropChange = (crop) => {
        setCrop(crop);
    };

    const onZoomChange = (zoom) => {
        setZoom(zoom);
    };

    const onCropAreaChange = useCallback((croppedArea, croppedAreaPixels) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const handleSave = async () => {
        try {
            // 如果是GIF，直接使用原图（跳过裁剪以保持动画）
            if (isGif) {
                onCropComplete(imageSrc);
                onClose();
                return;
            }

            const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels);
            onCropComplete(croppedImage);
            onClose();
        } catch (e) {
            console.error(e);
        }
    };

    if (!isOpen || !imageSrc) return null;

    return (
        <div className={styles.overlay}>
            <div className={styles.container}>
                {isGif && (
                    <div className={styles.gifNotice}>
                        <p>⚠️ GIF动图检测到！裁剪将使用原图以保持动画效果。</p>
                    </div>
                )}
                <div className={styles.cropContainer}>
                    <Cropper
                        image={imageSrc}
                        crop={crop}
                        zoom={zoom}
                        aspect={16 / 9}
                        onCropChange={onCropChange}
                        onCropComplete={onCropAreaChange}
                        onZoomChange={onZoomChange}
                    />
                </div>
                <div className={styles.controls}>
                    <input
                        type="range"
                        value={zoom}
                        min={1}
                        max={3}
                        step={0.1}
                        aria-labelledby="Zoom"
                        onChange={(e) => setZoom(e.target.value)}
                        className={styles.slider}
                        disabled={isGif}
                    />
                    <div className={styles.buttons}>
                        <button onClick={onClose} className={styles.cancelBtn}>Cancel</button>
                        <button onClick={handleSave} className={styles.saveBtn}>
                            {isGif ? 'Use Original' : 'Apply Crop'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CropModal;
