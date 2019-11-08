<template>
  <div>
    <form v-if="!showDeleteConfirmation">
      <div class="columns is-multiline">
        <div class="field column is-4">
          <label class="label"
                 for="badge-edit-name">Name</label>
          <div class="control">
            <input type="text"
                   class="input"
                   id="badge-edit-name"
                   placeholder="New Badge"
                   @blur="$v.badgeUpdate.name.$touch"
                   :class="{ 'is-danger': $v.badgeUpdate.name.$error }"
                   v-model="badgeUpdate.name">
          </div>
          <span class="help is-danger"
                v-if="$v.badgeUpdate.name.$error">
            The name of the merit badge is required
          </span>
        </div>
        <div class="field column is-8">
          <label class="label"
                 for="badge-edit-notes">Notes</label>
          <div class="control">
            <input type="text"
                   class="input"
                   id="badge-edit-notes"
                   placeholder="Notes about this badge"
                   v-model="badgeUpdate.notes">
          </div>
        </div>
        <div class="field column">
          <label class="label"
                 for="badge-edit-description">Description</label>
          <div class="control">
            <textarea class="textarea"
                      id="badge-edit-description"
                      rows="5"
                      placeholder="Description of this badge"
                      v-model="badgeUpdate.description"></textarea>
          </div>
        </div>
      </div>
      <div class="field is-grouped">
        <div class="control">
          <button class="button is-primary"
                  :disabled="$v.badgeUpdate.$invalid || saving"
                  :class="{ 'is-loading': saving }"
                  @click.prevent="updateBadge()">Save Changes</button>
        </div>
        <div class="control">
          <button class="button"
                  :disabled="saving"
                  @click.prevent="close()">Cancel</button>
        </div>
        <div class="control is-pulled-right">
          <button class="button is-danger"
                  :disabled="saving"
                  @click.prevent="showDeleteConfirm()">Delete Badge</button>
        </div>
      </div>
    </form>
    <confirm-delete v-if="showDeleteConfirmation"
                    :match-text="this.badge.name"
                    :placeholder="'Badge Name'"
                    @deleteSuccess="deleteBadge()"
                    @close="hideDeleteConfirm()">
      <span slot="header">
        Do you really want to delete this badge? This cannot be undone, and will likely break
        existing registration records!
      </span>
      <span slot="help-text">
        Enter the full name of this badge with correct capitalization to confirm that you
        wish to delete this badge.
        <b>This action cannot be undone, and will delete all associated completion records
          and badge requests!</b>
      </span>
    </confirm-delete>
  </div>
</template>

<script>
import { required } from 'vuelidate/lib/validators';

export default {
  props: {
    badge: {
      type: Object,
      required: true
    }
  },
  data () {
    return {
      error: '',
      showDeleteConfirmation: false,
      badgeUpdate: {
        name: '',
        description: '',
        notes: ''
      },
      saving: false
    };
  },
  methods: {
    updateBadge () {
      this.saving = true;

      let badge = {
        name: this.badgeUpdate.name,
        description: this.badgeUpdate.description,
        notes: this.badgeUpdate.notes
      };

      badge.id = this.badge.id;

      this.$store.dispatch('updateBadge', badge)
        .then(() => {
          return this.$store.dispatch('getBadges')
        })
        .then(() => {
          this.close();
        })
        .catch(() => {
          this.error = 'Error updating badge, please try again. Name is required.';
        })
        .then(() => {
          this.saving = false;
        });
    },
    deleteBadge () {
      this.$store.dispatch('deleteBadge', this.badge.id)
        .then(() => {
          this.$store.dispatch('getBadges');
          this.$emit('close');
        })
        .catch(() => {
          this.error = 'There was a problem deleting this badge.';
        })
    },
    showDeleteConfirm () {
      this.showDeleteConfirmation = true;
    },
    hideDeleteConfirm () {
      this.showDeleteConfirmation = false;
    },
    close () {
      this.$emit('close');
    }
  },
  mounted () {
    this.badgeUpdate.name = this.badge.name;
    this.badgeUpdate.description = this.badge.description;
    this.badgeUpdate.notes = this.badge.notes;
  },
  validations: {
    badgeUpdate: {
      name: { required }
    }
  }
}
</script>
