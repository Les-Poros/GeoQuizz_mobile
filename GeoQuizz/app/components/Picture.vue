<template>
  <Page>
    <ActionBar title="Geo Quizz"/>
    <ScrollView orientation="vertical">
      <StackLayout orientation="vertical" class="content">
        <label>Zone : {{nomZone}}</label>
        <Button text="Prendre une photo" @tap="takePicture" v-bind:isEnabled="estConnecte"/>
        <Button text="Choisir une photo" @tap="selectPicture" v-bind:isEnabled="estConnecte"/>
        <template id="modal" v-if="modalActive">
          <StackLayout class="p-20" backgroundColor="white">
            <Image :src="imgModal['src']" width="200" height="200"/>
            <label>latitude : {{imgModal['loc']['lat']}}</label>
            <TextField class="textField" v-model="newLat" hint="latitude"/>
            <label>longitude : {{imgModal['loc']['long']}}</label>
            <TextField class="textField" v-model="newLong" hint="longitude"/>
            <label>description :{{imgModal['descr']}} </label>
            <TextField class="textField" v-model="newdescr" hint="description"/>
            <Button class="btn btn-outline" text="Confirmer Info" @tap="sendLocation(imgModal)"/>
            <Button class="btn btn-outline" text="Supprimer la photo" @tap="removeImage(imgModal)"/>
            <Button class="btn btn-outline" text="Fermer" @tap="closeModal"/>
          </StackLayout>
        </template>
        <WrapLayout>
          <Image v-for="img in images" :src="img['src']" width="75" height="75" @tap="showModal(img)" class="images"/>
        </WrapLayout>
        <Button text="Envoyer les photos" @tap="sendPictures" v-bind:isEnabled="hasPicture" v-if="estConnecte"/>
        <label v-if="!estConnecte" textWrap="true">Vous êtes hors connexion. Vous ne pouvez pas prendre ni envoyer de photos !</label>
        <label v-if="missLocation" text="Au moins une de vos photos n'a pas de géolocalisation" textWrap="true"></label>
        <ActivityIndicator v-bind:busy="load" class="spinner"/>
      </StackLayout>
    </ScrollView>
  </Page>
</template>


<script>
import * as camera from "nativescript-camera";
import * as imagepicker from "nativescript-imagepicker";

import axios from "axios";
import CryptoJS from "crypto-js";

import conf from "../conf/conf.json";

import { Image } from "tns-core-modules/ui/image";
import { ImageSource, fromFile, fromResource, fromBase64 } from 'tns-core-modules/image-source';
import { connectionType, getConnectionType, startMonitoring, stopMonitoring }from "tns-core-modules/connectivity";
import { isEnabled, enableLocationRequest, getCurrentLocation, watchLocation, distance, clearWatch } from "nativescript-geolocation";

var geolocation = require("nativescript-geolocation");

export default {
  props: ["idZone", "urlZone", "nomZone"],
  data() {
    return {
      compteurIndex: -1,
      estConnecte: '',
      hasPicture: false,
      idPhoto: '',
      images: [],
      imgModal: '',
      load: false,
      localisation: [],
      missLocation: false,
      modalActive: false,
      newLat: '',
      newLong: '',
      postBody: '',
      newdescr:'',
      isSend: false
    };
  },
  methods: {
    selectPicture() {
      // Méthode qui permet de séléctionner une photo dans l'album
      // params : aucun
      // return : rien
      this.closeModal();
      let context = imagepicker.create({
        mode: "multiple"
      });

      context
        .authorize()
        .then(function() {
          return context.present();
        })
        .then(selection => {
          selection.forEach(selected => {
            let img = new Image();
            img.src = selected;

            let index = this.compteurIndex +1;

            let imgSrc = new ImageSource();
            imgSrc.fromAsset(selected).then(img => {
                let img64Base = img.toBase64String("jpeg", 70);
                let detailsFile = "data:image/jpeg;base64,"+img64Base;
                let tabImage = {src: selected, loc: {lat: "", long: ""},descr:"", index: index, details: detailsFile };
                this.images.push(tabImage);
                this.showModal(tabImage);
                
                this.compteurIndex += 1;
              });
            this.isEmptyImages();
          });
        })
        .catch(function(e) {
          console.log("error in selectPicture", e);
        });
    },
    takePicture() {
      // Méthode qui permet de prendre une photo depuis l'appareil photo d'un portable
      // params : aucun
      // return : rien
      this.closeModal();
      this.getLocationTap();
      camera
        .requestPermissions()
        .then(() => {
          camera
            .takePicture({
              width: 300,
              height: 300,
              keepAspectRatio: true,
              saveToGallery: false
            })
            .then(imageAsset => {
              let img = new Image();
              img.src = imageAsset;

              let index = this.compteurIndex +1;

              let imgSrc = new ImageSource();
              
              imgSrc.fromAsset(imageAsset).then(img => {
                let img64Base = img.toBase64String("jpeg", 70);
                let detailsFile = "data:image/jpeg;base64,"+img64Base;
                let tabImage = {src: imageAsset, loc: this.localisation, index: index, details: detailsFile };
                this.images.push(tabImage);
                this.showModal(tabImage);
                
                this.compteurIndex += 1;
              });
              this.isEmptyImages();
            })
            .catch(e => {
              console.log("error:", e);
            });
        })
        .catch(e => {
          console.log("Error requesting permission");
        });
    },
    getLocationTap() {
      // Méthode qui permet de géolocaliser le portable
      // params : aucun
      // return : rien
      var self = this;
      var lat = 0;
      var long = 0;
      geolocation.enableLocationRequest();
      var location = geolocation
        .getCurrentLocation({
          desiredAccuracy: 3,
          updateDistance: 10,
          maximumAge: 20000,
          timeout: 20000
        })
        .then(function(location) {
          lat = location.latitude;
          long = location.longitude;
          self.localisation = { lat: lat, long: long };
        });
    },
    isEmptyImages() {
      // Méthode qui permet d'activer ou désactiver le bouton envoyer
      // params : aucun
      // return : rien
      if (this.images.length != 0) {
        this.images.forEach(img => {
          if(img['loc']['lat'] !='' && img['loc']['long'] != ''){
            this.hasPicture = true;
            this.missLocation = false;
          }
          else{
            this.hasPicture = false;
            this.missLocation = true;
          }
        });
      }
      else{
        this.hasPicture = false;
      }
    },
    sendPictures() {
      // Méthode qui va envoyer les photos à la série
      // params : aucun
      // return : rien
      this.isSend = true;
      this.images.forEach(image => {
        if (this.estConnecte == true) {
          this.uploadFile(image);
          this.hasPicture = false;
        }
        else{
          this.load = false;
          this.isEmptyImages();
        }      
      });
    },
    showModal(img) {
      // Méthode qui ouvre une fenêtre modale avec une image
      // params : img = image que l'on a sélectionnée
      // return : rien
      this.isEmptyImages();
      this.modalActive = true;
      this.imgModal = img;
    },
    closeModal() {
      // Méthode qui ferme la fenêtre modale
      // params : aucun
      // return : rien
      this.modalActive = false;
      this.imgModal = "";
      this.newLat = '';
      this.newLong = '';
      this.newdescr = '';
    },
    removeImage(img) {
      // Méthode qui supprime la photo séléctionnée
      // params : img = image que l'on a sélectionnée
      // return : rien
      var index = '';
      for(var i=0; i < this.images.length; i++){
        if(this.images[i]['src'] == img['src']){
          index = i;
        }
      }
      this.images.splice(index, 1);
      this.modalActive = false;
      this.imgModal = "";
      this.newLat = '';
      this.newLong = '';
      this.newdescr = '';
      this.isEmptyImages();
    },
    sendLocation(img){
      // Méthode qui permet de modifie et d'envoyer une nouvelle localisation pour une image
      // params : img = image pour laquelle on souhaite modifier ses coordonnées GPS
      // return : rien
      var ind = '';
      for(var i=0; i < this.images.length; i++){
        if(this.images[i]['src'] == img['src']){
          ind = i;
        }
      }
      if(this.newLat != '' ){
        this.images[ind]['loc']['lat']=this.newLat;
      }
      if(this.newLong != ''){
        this.images[ind]['loc']['long']=this.newLong;
      }
      if(this.newdescr != '' ){
        this.images[ind]['descr']=this.newdescr;
      }
      this.isEmptyImages();
      this.closeModal();
    },
    uploadFile(detailsFile) {
      // Méthode qui permet d'uploader une image sur Cloudinary
      // params : detailsFile = les détails de l'image que l'on souhaite envoyer
      // return : rien
      this.load = true;
      let form = new FormData();
      let timestamps = ((Date.now() / 1000) | 0).toString();
      let keyAPI = "414295376186362";
      let secretAPI = "8nzZYlAX-zeo6k-Z8XNANXypq38";
      let stringHash = "timestamp="+timestamps+conf.secretAPI;
      let signature = CryptoJS.SHA1(stringHash).toString();

      form.append("file", detailsFile['details']);
      form.append("timestamp", timestamps);
      form.append("api_key", conf.keyAPI);
      form.append("signature", signature);

      let xhr = new XMLHttpRequest();
      xhr.open("POST", conf.uploadURLToCloudinary);
      xhr.onload = () => {
        let jsonXHR = JSON.parse(xhr.responseText);
        let idPublicCloud = jsonXHR.public_id;
        this.postBody = {
          "latitude": detailsFile['loc']['lat'],
          "longitude": detailsFile['loc']['long'],
          "descr": detailsFile['descr'],
          "url": jsonXHR.secure_url,
        };
        axios
          .post(this.urlZone+"series/"+this.idZone+"/photos", this.postBody, {
          headers: {
            "Content-Type": "application/json"
          },
        })
        .then(response => {
          console.log(response);
          this.closeModal();
          this.removeImage(detailsFile);
          this.load = false;
          if(!this.hasPicture){
            this.isSend = false;
          }
        });
      };
      xhr.send(form);
    }
  },
  created(){
    var myConnectionType = getConnectionType();
    if(myConnectionType != connectionType.none){
      this.estConnecte = true;
    }
    startMonitoring((newConnectionType) => {
      if(newConnectionType == connectionType.none){
        this.estConnecte = false;
      }
      else{
        this.estConnecte = true;
        if (this.isSend){
          this.sendPictures();
        }
      }
    });
  }
};
</script>

<style>
  .images{
    margin-left: 5px;
    margin-right: 5px;
    margin-bottom: 5px;
  }
</style>