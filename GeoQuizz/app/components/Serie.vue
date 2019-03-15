<template>
  <Page>
    <ActionBar title="Geo Quizz"/>
    <StackLayout class="content">
      <label text="Informations de la zone :"></label>
      <TextField class="textField" v-model="nomZone" hint="Nom de la zone"/>
      <TextField class="textField" v-model="latitudeZone" hint="Latitude de la zone"/>
      <TextField class="textField" v-model="longitudeZone" hint="Longitude de la zone"/>
      <label v-if="!connection" textWrap="true">Vous êtes hors connexion. Vous ne pouvez pas créer de séries !</label>
      <Button text="Créer la zone et ajouter des photos" @tap="createZone" v-bind:isEnabled="connection == true" />
    </StackLayout>
  </Page>
</template>

<script>
import axios from "axios";
import { connectionType, getConnectionType, startMonitoring, stopMonitoring }from "tns-core-modules/connectivity";

export default {
  data() {
    return {
      nomZone: "",
      latitudeZone: "",
      longitudeZone: "",
      postBody: "",
      idZone: "",
      link: "",
      connection: ''
    };
  },
  methods: {
    createZone() {
      this.postBody = {
        "ville": this.nomZone,
        "map_lat": this.latitudeZone,
        "map_lon": this.longitudeZone,
        "dist": 500
      };
      axios
        .post("https://lesporos.pagekite.me/series/", this.postBody, {
          headers: {
            "Content-Type": "application/json"
          },
        })
        .then(response => {
          this.idSerie = response.data.id;
          this.link = "http://lesporos.pagekite.me/series/"+this.idZone;
          this.$goTo("picture", { props: { idZone: this.idZone, url: this.link, nom: this.nomZone }});
        })
        .catch(error => {
          console.log(error);
        });
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
label{
  margin-top: 10px;
  text-align: center;
  color: black;
  font-size: 20pt;
}

/*.textField::selection{
  color:#FEAF37;
}*/

.textField{
  margin: 20px;
}

.content{
  width:90%;
}

</style>