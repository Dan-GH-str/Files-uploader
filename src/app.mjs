import { initializeApp } from "../firebase/app";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "../firebase/storage"
import {upload} from './upload.mjs'

const firebaseConfig = {
    apiKey: "AIzaSyDGo-41rBylIjiV3wcPTdmB0bceGo0qb6g",
    authDomain: "files-uploader-js.firebaseapp.com",
    projectId: "files-uploader-js",
    storageBucket: "files-uploader-js.appspot.com",
    messagingSenderId: "685277161496",
    appId: "1:685277161496:web:05778f26d0feccc15dbb6d"
}
const app = initializeApp(firebaseConfig)

// const storage = firebase.storage()
const storage = getStorage(app);

upload('#file', {
    multi: true,
    accept: ['.png', '.jpg', '.jpeg', '.gif'],
    onUpload(files, blocks) {
        files.forEach((file, index) => {
            const imagesRef = ref(storage, `image/${file.name}`)
            const task = uploadBytesResumable(imagesRef, file)

            task.on('state_changed', snapshot => {
                const percentage = ((snapshot.bytesTransferred / snapshot.totalBytes) * 100).toFixed(0) + '%'
                const block = blocks[index].querySelector('.preview-info-progress')
                block.textContent = percentage
                block.style.width = percentage
            }, error => {
                console.log(error)
            }, () => {
                getDownloadURL(imagesRef).then(url => {
                    console.log('URL:', url)        // Ссылка на картинку
                })
            })
        })
    }
})