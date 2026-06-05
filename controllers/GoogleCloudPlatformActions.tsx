import { Storage } from "@google-cloud/storage";
import { PROJECT_ID, BUCKET_PDF_NAME, BUCKET_PHOTO_NAME, KEYFILENAME} from "@/config/config";
export async function addContent(bucketName : string, file : string, fileOutputName : string){
    try{
        const projectId = PROJECT_ID;
        const keyFilename = KEYFILENAME;
        const storage = new Storage({projectId, keyFilename});

        const bucket = storage.bucket(bucketName);
        const ret = await bucket.upload(file, {
            destination : fileOutputName
        })
        return {
            success : true,
            data : ret,
        }
    }
    catch(error){
        return {
            success : false,
            error : error
        }
    }
}

export async function deleteContent(){
    
}