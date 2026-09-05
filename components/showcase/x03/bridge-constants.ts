/**
 * Gate 03D — Perceptual Bridge Integration. A-005's own dimensions, needed
 * by the structural bridge shader to replicate CSS object-cover UV
 * cropping (so the WebGL plane frames the photo identically to the DOM
 * <Image> it hands off from) and to size Sobel edge-detection texel steps
 * against the source resolution.
 */
export const A005_SRC = "/images/x03/A-005.png";
export const A005_WIDTH = 1086;
export const A005_HEIGHT = 1448;
export const A005_ASPECT = A005_WIDTH / A005_HEIGHT;
