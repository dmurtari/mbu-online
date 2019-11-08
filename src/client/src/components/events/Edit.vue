<template>
  <div>
    <div class="notification is-danger"
         v-if="error">
      <p>
        {{ error }}
      </p>
    </div>
    <form v-if="!showDeleteConfirmation">
      <div class="columns is-multiline">
        <div class="field column is-6">
          <label class="label"
                 for="event-edit-price">Registration Fee</label>
          <div class="control">
            <masked-input mask="11.11"
                          placeholder="00.00"
                          id="event-edit-price"
                          class="input"
                          :class="{ 'is-danger': $v.eventUpdate.price.$error }"
                          @blur="$v.eventUpdate.price.$touch"
                          v-model="eventUpdate.price"></masked-input>
          </div>
          <span class="help is-danger"
                v-if="$v.eventUpdate.price.$error">
            Please enter the price of the event (or 00.00)
          </span>
        </div>
        <div class="field column is-6">
          <label class="label"
                 for="event-edit-date">Date</label>
          <div class="control">
            <masked-input mask="11/11/1111"
                          placeholder="mm/dd/yyyy"
                          id="event-edit-date"
                          class="input"
                          :class="{ 'is-danger': $v.eventUpdate.date.$error }"
                          @blur="$v.eventUpdate.date.$touch"
                          v-model="eventUpdate.date"></masked-input>
          </div>
          <span class="help is-danger"
                v-if="$v.eventUpdate.date.$error">
            Please enter a valid date for this event
          </span>
        </div>
        <div class="field column is-6">
          <label class="label"
                 for="event-edit-open">Registration Opens</label>
          <div class="control">
            <masked-input mask="11/11/1111"
                          placeholder="mm/dd/yyyy"
                          id="event-edit-open"
                          class="input"
                          :class="{ 'is-danger': $v.eventUpdate.registration_open.$error }"
                          @blur="$v.eventUpdate.registration_open.$touch"
                          v-model="eventUpdate.registration_open"></masked-input>
          </div>
          <span class="help is-danger"
                v-if="$v.eventUpdate.registration_open.$error">
            Please enter a valid date for registration opening, before the day of the event
          </span>
        </div>
        <div class="field column is-6">
          <label class="label"
                 for="event-edit-close">Registration Closes</label>
          <div class="control">
            <masked-input mask="11/11/1111"
                          placeholder="mm/dd/yyyy"
                          id="event-create-close"
                          class="input"
                          :class="{ 'is-danger': $v.eventUpdate.registration_close.$error }"
                          @blur="$v.eventUpdate.registration_close.$touch"
                          v-model="eventUpdate.registration_close"></masked-input>
          </div>
          <span class="help is-danger"
                v-if="$v.eventUpdate.registration_close.$error">
            Please enter a valid date for registration closing, between registration opening
            and the event day
          </span>
        </div>
      </div>
      <div class="field is-grouped">
        <div class="control">
          <button class="button is-primary"
                  :disabled="$v.$invalid || saving"
                  :class="{ 'is-loading': saving }"
                  @click.prevent="updateEvent()">Update Event</button>
        </div>
        <div class="control">
          <button class="button is-default"
                  :disabled="saving"
                  @click.prevent="close()">Cancel</button>
        </div>
        <div class="control">
          <button class="button is-text"
                  :disabled="settingCurrent || saving"
                  :class="{ 'is-loading': settingCurrent }"
                  @click.prevent="setAsCurrent()">Set as the Current Event</button>
        </div>
        <div class="control is-pulled-right">
          <button class="button is-danger is-pulled-right"
                  :disabled="saving"
                  @click.prevent="showDeleteConfirm()">Delete Event</button>
        </div>
      </div>
    </form>
    <confirm-delete v-if="showDeleteConfirmation"
                    class="container-fluid"
                    :match-text="this.semesterAndYear"
                    :placeholder="'Summer 2008'"
                    @deleteSuccess="deleteEvent()"
                    @close="hideDeleteConfirm()">
      <span slot="header">
        Do you really want to delete this event? This cannot be undone, and will likely break
        existing registration records!
      </span>
      <span slot="help-text">
        Enter the semester and year to confirm deletion.
        <b>This action cannot be undone, and will also remove all data associated with
          this event, including registrations and completion records.</b>
      </span>
    </confirm-delete>
  </div>
</template>

<script>
import { required } from 'vuelidate/lib/validators';
import { date, beforeDate, betweenDate } from 'validators';

import moment from 'moment'

const dateFormat = 'MM/DD/YYYY'

export default {
  data () {
    return {
      eventUpdate: {
        date: '',
        registration_open: '',
        registration_close: '',
        price: ''
      },
      error: '',
      showDeleteConfirmation: false,
      saving: false,
      settingCurrent: false
    }
  },
  props: {
    event: {
      type: Object,
      required: true
    }
  },
  computed: {
    semesterAndYear () {
      return this.event.semester + ' ' + this.event.year;
    }
  },
  methods: {
    updateEvent () {
      this.saving = true;

      let event = {
        id: this.event.id,
        date: moment(this.eventUpdate.date, dateFormat),
        registration_open: moment(this.eventUpdate.registration_open, dateFormat),
        registration_close: moment(this.eventUpdate.registration_close, dateFormat),
        price: this.eventUpdate.price
      }

      this.$store.dispatch('updateEvent', event)
        .then(() => {
          console.info('Getting new events');
          return this.$store.dispatch('getEvents');
        })
        .then(() => {
          console.info('Closing');
          this.close();
        })
        .catch((err) => {
          console.info('Error')
          this.error = err;
        })
        .then(() => {
          console.info('Done')
          this.saving = false;
        });
    },
    deleteEvent () {
      this.$store.dispatch('deleteEvent', this.event.id)
        .then(() => {
          this.$store.dispatch('getEvents');
          this.$emit('close');
        })
        .catch(() => {
          this.error = 'There was a problem deleting this event.';
        });
    },
    setAsCurrent () {
      this.settingCurrent = true;
      this.$store.dispatch('saveCurrentEvent', this.event.id)
        .then(() => {
          return this.$store.dispatch('getEvents');
        }).then(() => {
          this.$emit('close');
        })
        .catch(() => {
          this.error = 'Failed to set this event as current.';
        })
        .then(() => {
          this.settingCurrent = false;
        });
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
    this.eventUpdate.date = moment(this.event.date).format(dateFormat);
    this.eventUpdate.registration_open =
      moment(this.event.registration_open).format(dateFormat);
    this.eventUpdate.registration_close =
      moment(this.event.registration_close).format(dateFormat);
    this.eventUpdate.price = this.event.price;
  },
  validations: {
    eventUpdate: {
      date: { required, date: date('MM/DD/YYYY') },
      registration_open: {
        required,
        date,
        beforeDate: beforeDate('date')
      },
      registration_close: {
        required,
        date,
        betweenDate: betweenDate('registration_open', 'date')
      },
      price: { required }
    }
  }
}
</script>
