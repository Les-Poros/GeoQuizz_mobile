<template>
    <Page>
        <ActionBar title="Geo Quizz"/>
        <StackLayout>
			<label text="Nom de la série :"></label>
			<TextField v-model="nomSerie" hint="Nom de la série" />
			<Button text="Créer la série et ajouter des photos" @tap="createSerie()" v-bind:isEnabled="nomSerie != ''" />
        </StackLayout>
    </Page>
</template>

<script>


export default {
	data() {
		return {
			nomSerie: "",
		}
	},
	methods:{
		createSerie(){
			/*requete axios pour créer la série*/
			this.$goTo('picture');
		}
	}
}
</script>