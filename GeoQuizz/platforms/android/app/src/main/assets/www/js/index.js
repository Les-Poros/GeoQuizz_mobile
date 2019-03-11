var app = new Vue({
    el: '#app',
    data: {
        pictureSource: "",
        destinationType: "",
    },
    methods: {
        onPhotoDataSuccess : function(imageData) {
            var smallImage = document.getElementById('smallImage');
      smallImage.style.display = 'block';
      smallImage.src = "data:image/jpeg;base64," + imageData;
        },onPhotoURISuccess : function(imageURI) {
            var largeImage = document.getElementById('largeImage');
      largeImage.style.display = 'block';
      largeImage.src = imageURI;
        },
        capturePhoto : function() {
            navigator.camera.getPicture(onPhotoDataSuccess, onFail, { quality: 50,
            destinationType: this.destinationType.DATA_URL });
        },
        getPhoto : function(source) {
            navigator.camera.getPicture(onPhotoDataSuccess, onFail, { quality: 50,
            destinationType: this.destinationType.FILE_URI,
            sourceType: source });
        },
        onFail : function(message) {
            if(message != "No Image Selected"){
                alert('Failed because: ' + message);
            }
        },
        onDeviceReady : function() {
            this.pictureSource=navigator.camera.PictureSourceType;
            this.destinationType=navigator.camera.DestinationType;
        }
    },
    computed: {
        
    }
});


document.addEventListener("deviceready",app.onDeviceReady);
