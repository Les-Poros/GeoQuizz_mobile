<template>
  <Page>
    <ActionBar title="Geo Quizz"/>
      <ScrollView orientation="vertical">
        <StackLayout class="content" orientation="vertical">
          <Image id="logo" src="~/logo.png" width="150" height="150"/>
          <ListPicker :items="getListOfSeries" v-model="position" v-if="estCompleteListe"></ListPicker>
          <Button text="Prendre une photo" @tap="redirectToPicture" v-bind:isEnabled="position != 0"/>
          <label class="homeLabel" text="ou :"></label>
          <Button text="Créer une zone" @tap="$goTo('serie')"/>
        </StackLayout>
      </ScrollView>
  </Page>
</template>

<script>
import { ListPicker } from "tns-core-modules/ui/list-picker";
import axios from "axios";

export default {
  props: ["url"],
  data() {
    return {
      listOfItems: [],
      position: 0,
      estCompleteListe: true
    };
  },
  methods: {
    redirectToPicture: function() {
      let idSerie = this.listOfItems[this.position - 1]["id"];
      this.$goTo("picture", { props: { idVille: idSerie, url: this.url } });
    }
  },
  computed: {
    getListOfSeries: function() {
      let listVilles = ["Choisissez une zone"];
      this.listOfItems.forEach(item => {
        listVilles.push(item["ville"]);
      });
      return listVilles;
    }
  },
  created() {
    axios
      .get("https://lesporos.pagekite.me/series")
      .then(response => {
        let contentSerie = response.data.content;
        contentSerie.forEach(content => {
          let city = { id: content.id, ville: content.ville };
          this.listOfItems.push(city);
        });
        this.estCompleteListe = true;
      })
      .catch(error => {
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
  width:80%;
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
</style>
