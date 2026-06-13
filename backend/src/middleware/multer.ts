import multer from 'multer'
import path from 'path'
import fs from 'fs'

// 1. Define the absolute path for the 'uploads' directory where files will be temporarily saved
const uploadDir = path.join(process.cwd(), 'uploads')

// 2. Check if the 'uploads' directory exists. If it doesn't, create it automatically.
// The { recursive: true } option ensures it creates any necessary parent folders too.
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true })
}

// 3. Configure how and where multer should store the incoming files on the disk
const storage = multer.diskStorage({
    // 'destination' tells multer which folder to save the uploaded files into
    destination(req, file, cb) {
        cb(null, uploadDir) // 'null' means no error occurred
    },
    
    // 'filename' defines what the saved file should be named
    filename(req, file, cb) {
        // We add a timestamp (Date.now()) before the original filename.
        // This prevents two files with the exact same name from overwriting each other.
        cb(null, Date.now() + '-' + file.originalname)
    }
})

// 4. Export the configured multer instance.
// This 'upload' object will be used as middleware in our routes (e.g., upload.fields(...))
export const upload = multer({ storage })