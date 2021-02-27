import { Injectable } from '@angular/core';

import {Plugins, CameraResultType, Capacitor,
  FilesystemDirectory, CameraPhoto,CameraSource} from '@capacitor/core';
import { resolve } from 'path';
import { Photo } from '../models/photo.interface';
  
const{Camera, Filesystem, Storage }= Plugins;

@Injectable({
  providedIn: 'root'
})
export class PhotoService {
  private photos: Photo[] = [];

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
