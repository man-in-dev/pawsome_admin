// // export const getCroppedImg = async (imageSrc, pixelCrop, rotation = 0) => {
// //   // Create an image element
// //   const image = await createImage(imageSrc)

// //   const canvas = document.createElement('canvas')
// //   const ctx = canvas.getContext('2d')

// //   const radians = (rotation * Math.PI) / 180

// //   // Set the canvas size to the crop size
// //   const sin = Math.abs(Math.sin(radians))
// //   const cos = Math.abs(Math.cos(radians))
// //   canvas.width = pixelCrop.width
// //   canvas.height = pixelCrop.height
// //   const rotatedWidth = width * cos + height * sin
// //   const rotatedHeight = width * sin + height * cos
// //   // Draw the image onto the canvas, cropping it
// //   ctx.drawImage(
// //     image,
// //     pixelCrop.x,
// //     pixelCrop.y,
// //     pixelCrop.width,
// //     pixelCrop.height,
// //     0,
// //     0,
// //     pixelCrop.width,
// //     pixelCrop.height
// //   )

// //   // Convert canvas contents to a blob
// //   return new Promise((resolve, reject) => {
// //     canvas.toBlob(blob => {
// //       if (!blob) {
// //         reject(new Error('Canvas is empty'))
// //         return
// //       }
// //       blob.name = 'cropped.jpeg'
// //       resolve(blob)
// //     }, 'image/jpeg')
// //   })
// // }

// // // Helper to load image as a DOM element
// // const createImage = url =>
// //   new Promise((resolve, reject) => {
// //     const image = new Image()
// //     image.addEventListener('load', () => resolve(image))
// //     image.addEventListener('error', error => reject(error))
// //     image.setAttribute('crossOrigin', 'anonymous') // Needed for cross-origin images
// //     image.src = url
// //   })

// // utils/cropImage.js

// /**
//  * Function to create a cropped image blob from the source image, crop area, and rotation.
//  * @param {string} imageSrc - The source image in Data URL format.
//  * @param {Object} pixelCrop - The crop area in pixels { x, y, width, height }.
//  * @param {number} rotation - Rotation angle in degrees.
//  * @returns {Promise<Blob>} - A promise that resolves to the cropped image blob.
//  */
// export const getCroppedImg = async (imageSrc, pixelCrop, rotation = 0) => {
//   const image = await createImage(imageSrc)
//   const canvas = document.createElement('canvas')
//   const ctx = canvas.getContext('2d')

//   // Convert rotation from degrees to radians
//   const radians = (rotation * Math.PI) / 180

//   // Calculate the size of the rotated image
//   const sin = Math.abs(Math.sin(radians))
//   const cos = Math.abs(Math.cos(radians))
//   const width = image.width
//   const height = image.height
//   const rotatedWidth = width * cos + height * sin
//   const rotatedHeight = width * sin + height * cos

//   // Set canvas size to the rotated size
//   canvas.width = rotatedWidth
//   canvas.height = rotatedHeight

//   // Translate canvas to the center to rotate around the center
//   ctx.translate(rotatedWidth / 2, rotatedHeight / 2)
//   ctx.rotate(radians)
//   ctx.translate(-width / 2, -height / 2)

//   // Draw the rotated image onto the canvas
//   ctx.drawImage(image, 0, 0)

//   // Now, crop the image
//   const croppedCanvas = document.createElement('canvas')
//   croppedCanvas.width = pixelCrop.width
//   croppedCanvas.height = pixelCrop.height
//   const croppedCtx = croppedCanvas.getContext('2d')

//   // Draw the cropped area from the rotated canvas onto the cropped canvas
//   croppedCtx.drawImage(
//     canvas,
//     pixelCrop.x,
//     pixelCrop.y,
//     pixelCrop.width,
//     pixelCrop.height,
//     0,
//     0,
//     pixelCrop.width,
//     pixelCrop.height
//   )

//   // Convert the cropped canvas to a blob
//   return new Promise((resolve, reject) => {
//     croppedCanvas.toBlob(blob => {
//       if (!blob) {
//         reject(new Error('Canvas is empty'))
//         return
//       }
//       blob.name = 'cropped.jpeg'
//       resolve(blob)
//     }, 'image/jpeg')
//   })
// }

// /**
//  * Helper function to load an image from a URL and return it as an HTMLImageElement.
//  * @param {string} url - The URL of the image.
//  * @returns {Promise<HTMLImageElement>} - A promise that resolves to the loaded image.
//  */
// const createImage = url =>
//   new Promise((resolve, reject) => {
//     const image = new Image()
//     image.addEventListener('load', () => resolve(image))
//     image.addEventListener('error', error => reject(error))
//     image.setAttribute('crossOrigin', 'anonymous') // Needed for cross-origin images
//     image.src = url
//   })

// utils/cropImage.js

/**
 * Creates an image element from a source URL and returns a promise that resolves with the image element.
 */
const createImage = url =>
  new Promise((resolve, reject) => {
    const image = new Image()
    image.setAttribute('crossOrigin', 'anonymous') // Handle CORS
    image.onload = () => resolve(image)
    image.onerror = reject
    image.src = url
  })

/**
 * Crops the image using a canvas to the specified cropped area pixels and rotation.
 */
export const getCroppedImg = async (imageSrc, pixelCrop, rotation = 0) => {
  const image = await createImage(imageSrc)
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')

  const { width, height } = pixelCrop
  canvas.width = width
  canvas.height = height

  // Convert rotation from degrees to radians and set the rotation center
  ctx.translate(width / 2, height / 2)
  ctx.rotate((rotation * Math.PI) / 180)
  ctx.translate(-width / 2, -height / 2)

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
  )

  return new Promise((resolve, reject) => {
    canvas.toBlob(blob => {
      if (!blob) {
        reject(new Error('Canvas is empty'))
      } else {
        blob.name = 'cropped.jpeg'
        resolve(blob)
      }
    }, 'image/jpeg')
  })
}

export const cropImage = async (image, croppedAreaPixels, onError) => {
  try {
    const croppedImage = await getCroppedImg(image, croppedAreaPixels)
    return croppedImage
  } catch (err) {
    onError(err)
  }
}
