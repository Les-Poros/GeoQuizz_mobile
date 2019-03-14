<template>
    <Page>
        <ActionBar title="Geo Quizz"/>
        <StackLayout>
			<label text="Série :"></label>
			<ListPicker :items="listOfItems" v-model="picked" ></ListPicker>
			<Button text="Prendre une photo" @tap="$goTo('picture', {props : { idSerie: picked}})" v-bind:isEnabled="picked != 0" />
			<label text="ou :"></label>
			<Button text="Créer une série" @tap="$goTo('serie')" />
        </StackLayout>
    </Page>
</template>

<script>

import { ListPicker } from "tns-core-modules/ui/list-picker";

export default {
	data() {
		return {
			listOfItems: ["Choisissez une série", "Nancy", "Londres"],
			picked: '0',
		}
	},
	methods:{
	}
}
</script>