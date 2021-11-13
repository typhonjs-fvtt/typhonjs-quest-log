<script>
   export let data;
</script>

This is a svelte component test:
<label>
   <input type=range bind:value={data.value} min=0 max=100>
   <input type=number bind:value={data.value} min=0 max=100>
</label>

<style>
   label { display: flex }
   input { margin: 6px }
   input[type=range] { min-width: 80% }
   input[type=number]::-webkit-inner-spin-button,
   input[type=number]::-webkit-outer-spin-button {
      opacity: 1;
   }
</style>