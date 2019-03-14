<template>
  <Page>
    <ActionBar title="Geo Quizz"/>
    <StackLayout>
      <label text="Série :"></label>
      <ListPicker :items="listOfItems" v-model="picked"></ListPicker>
      <Button
        text="Prendre une photo"
        @tap="$goTo('picture', {props : { idSerie: picked, url: url}})"
        v-bind:isEnabled="picked != 0"
      />
      <label text="ou :"></label>
      <Button text="Créer une série" @tap="$goTo('serie')"/>
    </StackLayout>
  </Page>
</template>

<script>
import { ListPicker } from "tns-core-modules/ui/list-picker";

export default {
  props: ["url"],
  data() {
    return {
      listOfItems: ["Choisissez une série", "Nancy", "Londres"],
      picked: "0"
    };
  },
  methods: {
    /*getListSeries: function () {
			axios
                .get('http://ainz.org/ws/2/artist/?query=artist:' + this.search.trim() + '&fmt=json')
                .then(response => {
                    this.listArtists = response.data.artists;
                    this.estVideArt = false;
                    console.log(this.listArtists);
                })
                .catch(error => {
                    console.log(error);
                })
		}*/
  }
};
</script>