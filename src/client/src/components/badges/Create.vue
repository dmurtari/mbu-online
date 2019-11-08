<template>
  <div class="box">
    <h4 class="title is-4">Add a New Merit Badge</h4>
    <p>
      Fill out the information below to add a new merit badge. Note that this will not
      be associated with any events (go to
      <router-link to="/administration"> the administration page</router-link>
      to manage merit badge offerings).
    </p>
    <br>
    <div class="notification is-danger"
         v-if="error">
      <p>
        {{ error }}
      </p>
    </div>
    <form>
      <div class="columns is-multiline">
        <div class="field column is-4">
          <label class="label"
                 for="badge-create-name">Name</label>
          <div class="control">
            <input type="text"
                   class="input"
                   id="badge-create-name"
                   placeholder="New Badge"
                   @blur="$v.badge.name.$touch"
                   :class="{ 'is-danger': $v.badge.name.$error }"
                   v-model="badge.name">
          </div>
          <span class="help is-danger"
                v-if="$v.badge.name.$error">
            The name of the merit badge is required
          </span>
        </div>
        <div class="field column is-8">
          <label class="label"
                 for="badge-create-notes">Notes</label>
          <div class="control">
            <input type="text"
                   class="input"
                   id="badge-create-notes"
                   placeholder="Notes about this badge"
                   v-model="badge.notes">
          </div>
        </div>
        <div class="field column is-12">
          <label class="label"
                 for="badge-create-description">Description</label>
          <div class="control">
            <textarea class="textarea"
                      id="badge-create-description"
                      rows="5"
                      placeholder="Description of this badge"
                      v-model="badge.description"></textarea>
          </div>
        </div>
      </div>
      <div class="field is-grouped">
        <div class="control">
          <button class="button is-primary"
                  :disabled="$v.$invalid || creating"
                  :class="{ 'is-loading': creating }"
                  @click.prevent="createBadge()">Create Badge</button>
        </div>
        <div class="control">
          <button class="button"
                  :disabled="creating"
                  @click.prevent="clearAndClose()">Cancel</button>
        </div>
      </div>
    </form>
  </div>
</template>

<script>
import _ from 'lodash';

import { required } from 'vuelidate/lib/validators';

export default {
  data () {
    return {
      error: '',
      badge: {
        name: '',
        description: '',
        notes: ''
      },
      creating: false
    };
  },
  methods: {
    createBadge () {
      this.creating = true;

      let badge = {
        name: this.badge.name,
        description: this.badge.description,
        notes: this.badge.notes
      };

      this.$store.dispatch('addBadge', badge)
        .then(() => {
          return this.$store.dispatch('getBadges')
        })
        .then(() => {
          this.$v.$reset();
          this.clearAndClose();
        })
        .catch(() => {
          this.error = 'Error creating badge, please refresh the page and try again';
        })
        .then(() => {
          this.creating = false;
        });
    },
    clearAndClose () {
      _.forEach(this.badge, (value, key) => {
        this.badge[key] = '';
      });

      this.error = '';
      this.close();
    },
    close () {
      this.$emit('close');
    }
  },
  validations: {
    badge: {
      name: { required }
    }
  }
}
</script>
