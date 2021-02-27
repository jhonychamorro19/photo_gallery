import { Injectable } from '@angular/core';
import {Plugins, CameraResultType, Capacitor,
  FilesystemDirectory, CameraPhoto,CameraSource} from '@capacitor/core';
import { resolve } from 'path';
import { promise } from 'protractor';
import { Photo } from '../models/photo.interface';
  
const{Camera, Filesystem, Storage }= Plugins;

@Injectable({
  providedIn: 'root'
})
export class PhotoService {
  private photos: Photo[] = [];
  private PHOTO_STORAGE = 'photos';
  constructor() { }

public async addNewToGallery () {

   // Take a photo
  const capturedPhoto = await Camera.getPhoto({
    resultType: CameraResultType.Uri,
    source: CameraSource.Camera,
    quality: 100
  });

  const saveImageFile = await this.savePicture(capturedPhoto);
  this. photos.unshift(saveImageFile);

  Storage.set ({
    key: this.PHOTO_STORAGE,
    value: JSON.stringify(this.photos.map(p => {
      const photoCopy = {... p};
      delete photoCopy.base64;
      return photoCopy;
    }))
  });
}

public async loadSaved() {
  // Retrieve cached photo array data
  const photos = await Storage.get({ 
    key: this.PHOTO_STORAGE });
  this.photos = JSON.parse(photos.value) || [];

  // Display the photo by reading into base64 format
  for (let photo of this.photos) {
  // Read each saved photo's data from the Filesystem
    const readFile = await Filesystem.readFile({
      path: photo.filepath,
      directory: FilesystemDirectory.Data
    });

  // Web platform only: Load the photo as base64 data
      photo.base64 = `data:image/jpeg;base64,${readFile.data}`;
  }
}

public getPhotos(): Photo[]{
  return this.photos;
}

private async savePicture(cameraPhoto: CameraPhoto){
  const base64Data = await this.readAsBase64(cameraPhoto);

  const fileName = new Date().getTime + '.jpeg';
  await Filesystem.writeFile({
    path: fileName,
    data: base64Data,
    directory: FilesystemDirectory.Data
  });

  return await this.getPhotoFile(cameraPhoto, fileName);
}

private async getPhotoFile(cameraPhoto: CameraPhoto, fileName: string): Promise<Photo>{
  return {
    filepath : fileName,
    webviewPath: cameraPhoto.webPath
  }
}

private async readAsBase64 (cameraPhoto: CameraPhoto){
  const response = await fetch(cameraPhoto.webPath);
  const blob = await response.blob();
  return await this.convertBlobToBase64(blob) as string;
}

convertBlobToBase64= (blob:Blob) => new Promise ((resolve,reject) =>{
  const reader = new FileReader;
  reader.onerror = reject;
  reader.onload = () => {
    resolve(reader.result);
  };
  reader.readAsDataURL(blob);
});

}
