<template>
    <Page>
        <ActionBar title="Geo Quizz"/>
        <StackLayout>
			<Button text="Prendre une photo" @tap="takePicture" />
			<Button text="Choisir une photo" @tap="selectPicture" />
			<Button text="voir localisation" @tap="GetLocationTap"/>
			<WrapLayout>
				<Image v-for="img in images" :src="img.src" width="75" height="75" />
			</WrapLayout>
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
			images:[]
		}
	},
	methods:{
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
					this.images.push(img);
				});
			}).catch(function (e) {
				console.log('error in selectPicture', e);
			});

		},
		takePicture() {
			camera.requestPermissions()
			.then(() => {
				camera.takePicture({ width: 300, height: 300, keepAspectRatio: true, saveToGallery:false })
				.then(imageAsset => {
					//let tabImage = [];
					let img = new Image();
					img.src = imageAsset;
					//let location = GetLocationTap();
					//tabImage = {'src' : imageAsset, 'loc' : location};
					//this.images.push(tabImage);
					this.images.push(img);
					console.log('ive got '+this.images.length+' images now.');
				})
				.catch(e => {
					console.log('error:', e);
				});
			})
			.catch(e => {
				console.log('Error requesting permission');
			});
		},GetLocationTap() {
			geolocation.enableLocationRequest();
			var location = geolocation.getCurrentLocation({desiredAccuracy: 3, updateDistance: 10, maximumAge: 20000, timeout: 20000}).
			then(function(location) {
				if (location) {
					alert("Current location is: " + location.latitude + " " + location.longitude);
					return [location.latitude,location.longitude];
				}
			}, function(e){
				console.log("Error: " + e.message);
			});
		}
	}
}
</script>