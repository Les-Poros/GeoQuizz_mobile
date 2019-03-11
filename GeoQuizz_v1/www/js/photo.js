

    var pictureSource;
    var destinationType;

    var tabImage;

    document.addEventListener("deviceready",onDeviceReady,false);

    function onDeviceReady() {
        pictureSource=navigator.camera.PictureSourceType;
        destinationType=navigator.camera.DestinationType;
    }

    function onPhotoDataSuccess(imageData) {
        var img = '<img style="width:100px;height:auto;" src="data:image/jpeg;base64,' + imageData +'" />';
        var photos = $('.photos').html();
        $('.photos').html(photos + img);
        navigator.geolocation.getCurrentPosition(onSuccess, onError);
    }

    function onPhotoURISuccess(imageURI) {
        var img = '<img style="width:100px;height:auto;" src="' + imageURI +'" />';
        var photos = $('.photos').html();
        $('.photos').html(photos + img);
      }

    function capturePhoto() {
      navigator.camera.getPicture(onPhotoDataSuccess, onFail, { quality: 50,
        destinationType: destinationType.DATA_URL });
        
    }


    function getPhoto(source) {
      navigator.camera.getPicture(onPhotoURISuccess, onFail, { quality: 50,
        destinationType: destinationType.FILE_URI,
        sourceType: source });
    }

    function onFail(message) {
      if(message != "No Image Selected"){
        alert('Failed because: ' + message);
      }
    }

    function onSuccess(position) {
        alert('Latitude: '          + position.coords.latitude          + '\n' +
              'Longitude: '         + position.coords.longitude         + '\n' );
    };

    function onError(error) {
        alert('code: '    + error.code    + '\n' +
              'message: ' + error.message + '\n');
    }
