<template>
  <Page>
    <ActionBar title="Geo Quizz"/>
    <StackLayout>
      <label text="Nom de la série :"></label>
      <TextField v-model="nomVille" hint="Nom de la série"/>
      <TextField v-model="latitudeVille" hint="Latitude de la ville"/>
      <TextField v-model="longitudeVille" hint="Longitude de la ville"/>
      <Button
        text="Créer la série et ajouter des photos"
        @tap="createSerie"
        v-bind:isEnabled="nomSerie != ''"
      />
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
      postBody: ""
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
          this.$goTo("picture");
        })
        .catch(error => {
          console.log(error);
        });
    }
  }
};
</script>