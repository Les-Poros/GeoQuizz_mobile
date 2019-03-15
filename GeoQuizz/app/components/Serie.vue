<template>
  <Page>
    <ActionBar title="Geo Quizz"/>
    <StackLayout class="content">
      <label text="Nom de la série :"></label>
      <TextField class="textField" v-model="nomVille" hint="Nom de la série"/>
      <TextField class="textField" v-model="latitudeVille" hint="Latitude de la zone"/>
      <TextField class="textField" v-model="longitudeVille" hint="Longitude de la zone"/>
      <Button text="Créer la zone et ajouter des photos" @tap="createSerie" v-bind:isEnabled="nomSerie != ''" />
    </StackLayout>
  </Page>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      nomVille: "",
      latitudeVille: "",
      longitudeVille: "",
      postBody: "",
      idSerie: "",
      link: ""
    };
  },
  methods: {
    createSerie() {
      this.postBody = {
        "ville": this.nomVille,
        "map_lat": this.latitudeVille,
        "map_lon": this.longitudeVille,
        "dist": 500
      };
      axios
        .post("https://lesporos.pagekite.me/series", this.postBody, {
          headers: {
            "Content-Type": "application/json"
          },
        })
        .then(response => {
          this.idSerie = response.data.id;
          this.link = "http://lesporos.pagekite.me/series/"+this.idSerie;
          this.$goTo("picture", { props: { idVille: this.idSerie, url: this.link }});
        })
        .catch(error => {
          console.log(error);
        });
    }
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