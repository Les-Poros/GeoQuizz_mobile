<template>
  <Page>
    <ActionBar title="Geo Quizz"/>
      <ScrollView orientation="vertical">
        <StackLayout class="content" orientation="vertical">
          <label v-if="!estConnecte" textWrap="true">Vous êtes hors connexion. Vous ne pouvez pas prendre de photos et créer de séries !</label>
          <Image id="logo" src="~/logo.png" width="150" height="150"/>
          <ActivityIndicator v-bind:busy="load" class="spinner"/>
          <ListPicker :items="getListOfSeries" v-model="position" v-if="estCompleteListe"></ListPicker>
          <Button text="Prendre une photo" @tap="redirectToPicture" v-bind:isEnabled="position != 0"/>
          <label class="homeLabel" text="ou :"></label>
          <Button text="Créer une zone" @tap="$goTo('serie', { props: { urlZone: urlZone} })" v-bind:isEnabled='estConnecte == true'/>
        </StackLayout>
      </ScrollView>
  </Page>
</template>

<script>
import axios from "axios";

import { ListPicker } from "tns-core-modules/ui/list-picker";
import { connectionType, getConnectionType, startMonitoring, stopMonitoring }from "tns-core-modules/connectivity";

export default {
  props: ["urlZone"],
  data() {
    return {
      estConnecte: '',
      estCompleteListe: true,
      listOfZones: [],
      load: true,
      position: 0
    };
  },
  methods: {
    redirectToPicture: function() {
      // Méthode qui redirige vers le component Picture
      // params : aucun
      // return : redirection vers le component Picture et son contenu
      let idZone = this.listOfZones[this.position - 1]["id"];
      let nomZone = this.listOfZones[this.position - 1]["zone"];
      this.$goTo("picture", { props: { idZone: idZone, urlZone: this.urlZone, nomZone: nomZone} });
    }  
  },
  computed: {
    getListOfSeries: function() {
      // Méthode qui crée la liste des zones et la retourne
      // params : aucun
      // return : la liste de toutes les zones de GeoQuizz
      let listZones = ["Choisissez une zone"];
      this.listOfZones.forEach(item => {
        listZones.push(item["zone"]);
      });
      return listZones;
    }
  },
  created() {
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
        axios
          .get(this.urlZone+"series")
          .then(response => {
            let contentSerie = response.data.content;
            contentSerie.forEach(content => {
              let zone = { id: content.id, zone: content.ville };
              this.listOfZones.push(zone);
            });
            this.estCompleteListe = true;
            this.load = false;
          })
          .catch(error => {
            alert("Le serveur n'est pas accessible");
            this.load = false;
            console.log(error);
          });
  }
};
</script>

<style>
.homeLabel{
  text-align: center;
  color: black;
  font-size: 20pt;
}

.content{
  width: 80%;
}

#logo{
  margin: 50px;
  margin-bottom: 20px;
}

Button{
  margin: 20px;
  background-color: #FEAF37;
  border-radius: 15px;
}

.spinner{
  color: #FEAF37;
}
</style>
