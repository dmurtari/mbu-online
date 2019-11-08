<template>
  <div>
    <div class="field">
      <label class="label"
             for="delete-confirm">
        <slot name="header"></slot>
      </label>
      <div class="notification is-danger"
           v-if="error">
        <p>{{ error }}</p>
      </div>
      <div class="control">
        <input type="text"
               :placeholder="placeholder"
               class="input"
               id="delete-confirm"
               v-model="enteredText">
      </div>
      <span class="help">
        <slot name="help-text"></slot>
      </span>
    </div>
    <div class="field is-grouped">
      <div class="control">
        <button class="button"
                @click.prevent="cancel()">{{ cancelText }}</button>
      </div>
      <div class="control">
        <button class="button is-danger"
                :disabled="enteredText != matchText"
                @click.prevent="confirmDelete()">{{ confirmText }}</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    matchText: {
      type: String,
      required: true
    },
    placeholder: String,
    cancelText: {
      type: String,
      default: 'Don\'t Delete'
    },
    confirmText: {
      type: String,
      default: 'Confirm Deletion'
    }
  },
  data () {
    return {
      enteredText: '',
      error: ''
    }
  },
  methods: {
    confirmDelete () {
      if (this.enteredText === this.matchText) {
        this.error = '';
        this.$emit('deleteSuccess');
      } else {
        this.error = 'The text you entered doesn\'t match the required text.'
      }
    },
    cancel () {
      this.error = '';
      this.$emit('close');
    }
  }
}
</script>

<style lang="scss" scoped>
.help {
  font-size: 1rem;
}
</style>