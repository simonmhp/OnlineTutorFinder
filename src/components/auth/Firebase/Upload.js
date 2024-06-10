import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { imageDb } from "./Firebase";

const upload = async (file) => {
    const date = new Date();
    const storageRef = ref(imageDb, `images/${date}-${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    return new Promise((resolve, reject) => {
        uploadTask.on(
            'state_changed',
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                console.log('Upload is ' + progress + '% done');
            }, 
            (error) => {
                switch (error.code) {
                    case 'storage/unauthorized':
                        reject("Something went wrong:"+ error.code);
                        break;
                    case 'storage/canceled':
                        reject("Something went wrong:"+ error.code);
                        break;
                    case 'storage/unknown':
                        reject("Something went wrong:"+ error.code);
                        break;
                    default:
                        reject("Something went wrong:"+ error.code);
                }
            }, 
            () => {
                getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                    console.log('File available at', downloadURL);
                    resolve(downloadURL); // Resolve the promise with the downloadURL
                }).catch((error) => {
                    reject(error); // Reject the promise if there's an error getting the download URL
                });
            }
        );
    });
}

export default upload;
