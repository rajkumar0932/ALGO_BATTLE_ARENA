import { v2 as cloudinary } from "cloudinary"
import fs from "fs"






const uploadOnCloudinary = async (localFilePath: string) => {
    try {
        if (!localFilePath) return null;
        
        // TEMPORARY MOCK FOR TESTING (Bypasses missing .env credentials)
        if (process.env.CLOUD_NAME === 'your_cloudinary_cloud_name' || !process.env.CLOUD_NAME) {
            console.log("Mocking Cloudinary Upload for testing...");
            fs.unlinkSync(localFilePath);
            return { url: "http://res.cloudinary.com/demo/image/upload/sample.jpg" };
        }

        cloudinary.config({
            cloud_name: process.env.CLOUD_NAME,
            api_key: process.env.API_KEY,
            api_secret: process.env.API_SECRET
        });
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        });
        fs.unlinkSync(localFilePath);
        return response;

    } catch (error) {
        if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath);
        }
        return null;
    }
}



export { uploadOnCloudinary }