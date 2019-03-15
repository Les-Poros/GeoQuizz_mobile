<template>
  <Page>
    <ActionBar title="Geo Quizz"/>
    <ScrollView orientation="vertical">
      <StackLayout orientation="vertical">
        <Button text="Prendre une photo" @tap="takePicture"/>
        <Button text="Choisir une photo" @tap="selectPicture"/>
        <!--<Button text="voir localisation" @tap="GetLocationTap"/>-->
        <template id="modal" v-if="modalActive">
          <StackLayout class="p-20" backgroundColor="white">
            <Image :src="imgModal['src']" width="200" height="200"/>
            <Button class="btn btn-outline" text="Supprimer la photo" @tap="removeImage(imgModal)"/>
            <Button class="btn btn-outline" text="Fermer" @tap="closeModal()"/>
          </StackLayout>
        </template>

        <WrapLayout>
          <Image
            v-for="img in images"
            :src="img['src']"
            width="75"
            height="75"
            @tap="showModal(img)"
          />
        </WrapLayout>
        <!--<label v-for="img in imagesAvecLoc" :text="img['loc']['lat']" ></label>-->
        <Button text="Envoyer les photos" @tap="sendPictures()" v-bind:isEnabled="hasPicture"/>
      </StackLayout>
    </ScrollView>
  </Page>
</template>



<script>
import * as camera from "nativescript-camera";
import * as imagepicker from "nativescript-imagepicker";

import { Image } from "tns-core-modules/ui/image";
import {
  isEnabled,
  enableLocationRequest,
  getCurrentLocation,
  watchLocation,
  distance,
  clearWatch
} from "nativescript-geolocation";
var geolocation = require("nativescript-geolocation");
import axios from "axios";
//var VueScrollTo = require('vue-scrollto');

//import ModalComponent from "./ModalComponent";

export default {
  props: ["idVille", "url"],
  data() {
    return {
      images: [],
      localisation: [],
      hasPicture: false,
      modalActive: false,
      imgModal: "",
      postBody: "",
      idPhoto: ""
    };
  },
  methods: {
    // Méthode qui permet de séléctionner une photo dans l'album
    selectPicture() {
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

            let index = this.images.length;

            let tabImage = { src: selected, loc: {lat: "", long: ""}, index: index, extension: ext };
            this.images.push(tabImage);

            this.isEmptyImages();
          });
        })
        .catch(function(e) {
          console.log("error in selectPicture", e);
        });
    },
    takePicture() {
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

              let index = this.images.length;

              let tabImage = {
                src: imageAsset,
                loc: this.localisation,
                index: index,
                extension: ext
              };
              this.images.push(tabImage);

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
        this.hasPicture = true;
      }
    },
    // Méthode qui va envoyer les photos à la série
    sendPictures() {
      this.images.forEach(image => {
        this.postBody = {
          "latitude": image['loc']['lat'],
          "longitude": image['loc']['long'],
          "desc": "",
          "url": image['extension']
        };
        axios
          .post("https://lesporos.pagekite.me/series/"+this.idVille+"/photos", this.postBody, {
          headers: {
            "Content-Type": "application/json"
          },
        })
        .then(response => {
          this.idPhoto = response.data.id;
          /*axios.put("https://lesporos.pagekite.me/series/"+this.idVille+"/photos/"+this.idPhoto)*/
        });
      });
    },
    // Méthode qui ouvre une modale avec l'image
    showModal(img) {
      this.modalActive = true;
      this.imgModal = img;
    },
    closeModal() {
      // Méthode qui ferme la modale
      this.modalActive = false;
      this.imgModal = "";
    },
    removeImage(img) {
      // Méthode qui supprime la photo séléctionnée
      this.images.splice(img["index"], 1);
      this.modalActive = false;
      this.imgModal = "";
    }
  }
};
</script>