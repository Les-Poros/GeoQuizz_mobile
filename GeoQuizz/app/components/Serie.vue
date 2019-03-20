<template>
  <Page>
    <ActionBar title="Geo Quizz"/>
    <StackLayout class="content">
      <label text="Informations de la zone :"></label>
      <TextField class="textField" v-model="nomZone" hint="Nom de la zone"/>
      <TextField class="textField" v-model="latitudeZone" hint="Latitude de la zone"/>
      <TextField class="textField" v-model="longitudeZone" hint="Longitude de la zone"/>
      <label v-if="!estConnecte" textWrap="true">Vous êtes hors connexion. Vous ne pouvez pas créer de zone !</label>
      <Button v-if="estConnecte" text="Créer la zone et ajouter des photos" @tap="createZone" v-bind:isEnabled="nomZone != '' && latitudeZone!='' && longitudeZone!=''" />
      <ActivityIndicator v-bind:busy="load" class="spinner"/>
    </StackLayout>
  </Page>
</template>

<script>
import axios from "axios";

import { connectionType, getConnectionType, startMonitoring, stopMonitoring }from "tns-core-modules/connectivity";

export default {
  props: ["urlZone"],
  data() {
    return {
      estConnecte: '',
      idZone: '',
      latitudeZone: '',
      linkZone: '',
      load: false,
      longitudeZone: '',
      nomZone: '',
      postBody: '',
      linkZone: ''
    };
  },
  methods: {
    createZone() {
      // Méthode qui crée une zone dans la base de données de notre API
      // params : aucun
      // return : rien
      this.load = true;
      this.postBody = {
        "ville": this.nomZone,
        "map_lat": this.latitudeZone,
        "map_lon": this.longitudeZone,
        "dist": 100
      };
      axios
        .post(this.urlZone+"series/", this.postBody, {
          headers: {
            "Content-Type": "application/json"
          },
        })
        .then(response => {
          this.idSerie = response.data.id;
          this.linkZone = this.urlZone+"series/"+this.idZone;
          this.$goTo("picture", { props: { idZone: this.idZone, urlZone: this.linkZone, nomZone: this.nomZone }});
        })
        .catch(error => {
          console.log(error);
        });
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

.textField{
  margin: 20px;
}

.content{
  width:90%;
}
</style>