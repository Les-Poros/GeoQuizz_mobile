<template>
    <Page>
        <ActionBar title="Geo Quizz"/>
        <StackLayout>
			<Button text="Prendre une photo" @tap="takePicture" />
			<Button text="Choisir une photo" @tap="selectPicture" />
			<Button text="voir localisation" @tap="GetLocationTap"/>
			<WrapLayout>
				<Image v-for="img in images" :src="img['src']" width="75" height="75" />
			</WrapLayout>
			<!--<label v-for="img in imagesAvecLoc" :text="img['loc']['lat']" ></label>-->
        </StackLayout>
    </Page>
</template>

<script>
import * as camera from "nativescript-camera";
import * as imagepicker from "nativescript-imagepicker";

import { Image } from "tns-core-modules/ui/image";
import { isEnabled, enableLocationRequest, getCurrentLocation, watchLocation, distance, clearWatch } from "nativescript-geolocation";
var geolocation = require("nativescript-geolocation");

export default {
	data() {
		return {
			images:[],
			localisation: [],
		}
	},
	methods:{
		// Méthode qui permet de séléctionner une photo dans l'album
		selectPicture() {

			let context = imagepicker.create({
				mode: 'multiple' 
			});

			context.authorize()
			.then(function() {
				return context.present();
			})
			.then(selection => {
				selection.forEach(selected => {
					
					console.log(JSON.stringify(selected));

					let img = new Image();
					img.src = selected;

					let tabImage = {'src' : selected, 'loc' : ''};
					this.images.push(tabImage);
				});
			}).catch(function (e) {
				console.log('error in selectPicture', e);
			});

		},
		takePicture() {
		// Méthode qui permet de prendre une photo
			this.GetLocationTap();
			camera.requestPermissions()
			.then(() => {
				camera.takePicture({ width: 300, height: 300, keepAspectRatio: true, saveToGallery:false })
				.then(imageAsset => {
					let img = new Image();
					img.src = imageAsset;

					let tabImage = {'src' : imageAsset, 'loc' : this.localisation};
					this.images.push(tabImage);
					console.log('ive got '+this.images.length+' images now.');
				})
				.catch(e => {
					console.log('error:', e);
				});
			})
			.catch(e => {
				console.log('Error requesting permission');
			});
		},
		// Méthode qui permet de géolocaliser le portable
		GetLocationTap() {
			var self = this;
			var lat = 0;
			var long = 0;
			geolocation.enableLocationRequest();
			var location = geolocation.getCurrentLocation({desiredAccuracy: 3, updateDistance: 10, maximumAge: 20000, timeout: 20000}).
			then(function(location) {
					//alert("Current location is: " + location.latitude + " " + location.longitude);
					lat = location.latitude;
					long = location.longitude;
					self.localisation = {'lat' : lat, 'long' : long};
			});
		}
	}
}
</script>