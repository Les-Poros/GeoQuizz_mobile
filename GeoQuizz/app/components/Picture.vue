<template>
  <Page>
    <ActionBar title="Geo Quizz"/>
    <ScrollView orientation="vertical">
      <StackLayout orientation="vertical">
        <label>Zone : {{nom}}</label>
        <Button text="Prendre une photo" @tap="takePicture"/>
        <Button text="Choisir une photo" @tap="selectPicture"/>
        <label v-if="!connection" textWrap="true">Vous êtes hors connexion. Vous ne pouvez pas envoyer de photos !</label>
        <template id="modal" v-if="modalActive">
          <StackLayout class="p-20" backgroundColor="white">
            <Image class="images" :src="imgModal['src']" width="200" height="200"/>
            <label>latitude : {{imgModal['loc']['lat']}}</label>
            <TextField class="textField" v-model="newLat" hint="latitude"/>
            <label>longitude : {{imgModal['loc']['long']}}</label>
            <TextField class="textField" v-model="newLong" hint="longitude"/>
            <Button class="btn btn-outline" text="Confirmer localisation" @tap="sendLocation(imgModal)"/>
            <Button class="btn btn-outline" text="Supprimer la photo" @tap="removeImage(imgModal)"/>
            <Button class="btn btn-outline" text="Fermer" @tap="closeModal()"/>
          </StackLayout>
        </template>

        <WrapLayout>
          <Image v-for="img in images" :src="img['src']" width="75" height="75" @tap="showModal(img)" />
        </WrapLayout>
        <!--<label v-for="img in imagesAvecLoc" :text="img['loc']['lat']" ></label>-->
        <Button text="Envoyer les photos" @tap="sendPictures()" v-bind:isEnabled="hasPicture" v-if="connection"/>
        <label v-if="missLocation" text="Au moins une de vos photos n'a pas de géolocalisation" textWrap="true"></label>

        <!--<label v-for="i in images">{{i['index']}}</label>-->
      </StackLayout>
    </ScrollView>
  </Page>
</template>



<script>
import * as camera from "nativescript-camera";
import * as imagepicker from "nativescript-imagepicker";

import { Image } from "tns-core-modules/ui/image";
import { isEnabled, enableLocationRequest, getCurrentLocation, watchLocation, distance, clearWatch } from "nativescript-geolocation";
var geolocation = require("nativescript-geolocation");

import axios from "axios";

import { connectionType, getConnectionType, startMonitoring, stopMonitoring }from "tns-core-modules/connectivity";


export default {
  props: ["idZone", "url", "nom" ],
  data() {
    return {
      images: [],
      localisation: [],
      hasPicture: false,
      modalActive: false,
      imgModal: "",
      connection: '',
      postBody: "",
      idPhoto: "",
      newLat: '',
      newLong: '',
      missLocation: false,
      compteurIndex: -1,
    };
  },
  methods: {
    // Méthode qui permet de séléctionner une photo dans l'album
    selectPicture() {
      this.closeModal()
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

            let jsonImg = JSON.stringify(selected);
            let storageImage = Object.values(selected).slice(-1)[0];
            var splitImage = storageImage.split('.');
            let ext = '.'+splitImage[splitImage.length-1];

            let img = new Image();
            img.src = selected;

            let index = this.compteurIndex +1;

            let tabImage = { src: selected, loc: {lat: "", long: ""}, index: index, extension: ext };
            this.images.push(tabImage);

            this.compteurIndex += 1;

            this.showModal(tabImage);

            this.isEmptyImages();
          });
        })
        .catch(function(e) {
          console.log("error in selectPicture", e);
        });
    },
    takePicture() {
      this. closeModal()
      // Méthode qui permet de prendre une photo
      this.GetLocationTap();
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
              
              let jsonImg = JSON.stringify(imageAsset);
              let storageImage = Object.values(imageAsset).slice(-1)[0];
              var splitImage = storageImage.split('.');
              let ext = '.'+splitImage[splitImage.length-1];

              let img = new Image();
              img.src = imageAsset;

            let index = this.compteurIndex +1;

              let tabImage = {src: imageAsset, loc: this.localisation, index: index, extension: ext };
              this.images.push(tabImage);
              
            this.compteurIndex += 1;

              this.showModal(tabImage);

              this.isEmptyImages();
              console.log("ive got " + this.images.length + " images now.");
            })
            .catch(e => {
              console.log("error:", e);
            });
        })
        .catch(e => {
          console.log("Error requesting permission");
        });
    },
    // Méthode qui permet de géolocaliser le portable
    GetLocationTap() {
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
          //alert("Current location is: " + location.latitude + " " + location.longitude);
          lat = location.latitude;
          long = location.longitude;
          self.localisation = { lat: lat, long: long };
        });
    },
    // Méthode qui permet d'activer ou désactiver le bouton envoyer
    isEmptyImages() {
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
    // Méthode qui va envoyer les photos à la série
    sendPictures() {
      this.images.forEach(image => {
        this.postBody = {
          "latitude": image['loc']['lat'],
          "longitude": image['loc']['long'],
          "desc": ""
        };
        axios
          .post("https://lesporos.pagekite.me/series/"+this.idZone+"/photos", this.postBody, {
          headers: {
            "Content-Type": "application/json"
          },
        })
        .then(response => {
          this.idPhoto = response.data.id;
          this.putBody = {
            "url": "http://res.cloudinary.com/lesporos/image/upload/"+this.idPhoto+".jpg",
          };
          axios
            .put("https://lesporos.pagekite.me/series/"+this.idZone+"/photos/"+this.idPhoto, this.putBody, {
            headers: {
              "Content-Type": "application/json"
            },
          });
        });
      });
    },
    // Méthode qui ouvre une modale avec l'image
    showModal(img) {
      this.isEmptyImages();
      this.modalActive = true;
      this.imgModal = img;
    },
    closeModal() {
      // Méthode qui ferme la modale
      this.modalActive = false;
      this.imgModal = "";
      this.newLat = '';
      this.newLong = '';
    },
    removeImage(img) {
      // Méthode qui supprime la photo séléctionnée
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
      this.isEmptyImages();
    },
    sendLocation(img){
      var ind = img['index'];
      if(this.newLat != '' ){
        this.images[ind]['loc']['lat']=this.newLat;
      }
      if(this.newLong != ''){
        this.images[ind]['loc']['long']=this.newLong;
      }
      this.isEmptyImages();
    }
  },
  created(){
    var myConn = getConnectionType();
    if(myConn != connectionType.none){
      this.connection = true;
    }
    startMonitoring((newConnectionType) => {
      if(newConnectionType == connectionType.none){
        this.connection = false;
      }
      else{
        this.connection = true;
      }
    });
  }
};
</script>

<style>
  .images{
    margin: 5px;
  }
</style>
